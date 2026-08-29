import { Fragment, useEffect, useRef } from 'react';
import { useLocale } from './useLocale.js';

// Alpha map per logo, decoded once and shared by every row that uses the file.
// The logos are PNGs with a lot of nothing in them — Télécom SudParis fills 42%
// of its file, ChemAI 59% — and on top of that `object-contain` letterboxes them
// inside a square box, so Atos draws 22px tall in 80px of height. A link the
// size of the box is therefore mostly empty space, which is what made the cursor
// turn into a hand well away from the mark.
const alphaMaps = new Map();

// Sampling grid. Small on purpose: this only decides whether a point is on the
// artwork, so a 96px map is ample and costs ~9KB per logo.
const GRID = 96;
// Slack in grid cells, so thin strokes and the gaps inside a letterform stay
// comfortably clickable rather than demanding pixel accuracy.
const SLACK = 2;
const OPAQUE = 24;

// Ink alone is not the target the eye aims at. The École Polytechnique mark is
// two crossed cannons, so its middle — the obvious place to click — falls in the
// open notch between the arms and was dead. The notches face outwards, so
// filling enclosed holes would not have reached them.
//
// Instead each row is filled between its outermost ink, each column likewise,
// and a point counts as on the mark only where both agree. That closes the
// notches without swallowing the empty corners a single span would: on the X it
// takes the live area from 32% of the grid to 48%, and it barely moves the
// wordmarks, which have little interior to fill.
function fillInterior(ink, w, h) {
    const rows = new Int16Array(h * 2).fill(-1);
    const cols = new Int16Array(w * 2).fill(-1);
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (!ink[y * w + x]) continue;
            if (rows[y * 2] < 0) rows[y * 2] = x;
            rows[y * 2 + 1] = x;
            if (cols[x * 2] < 0) cols[x * 2] = y;
            cols[x * 2 + 1] = y;
        }
    }
    const out = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) {
        const r0 = rows[y * 2], r1 = rows[y * 2 + 1];
        if (r0 < 0) continue;
        for (let x = r0; x <= r1; x++) {
            const c0 = cols[x * 2], c1 = cols[x * 2 + 1];
            if (c0 >= 0 && y >= c0 && y <= c1) out[y * w + x] = 1;
        }
    }
    return out;
}

function alphaMapFor(src) {
    if (alphaMaps.has(src)) return alphaMaps.get(src);
    const entry = { ready: false, w: 0, h: 0, nw: 0, nh: 0, a: null };
    alphaMaps.set(src, entry);
    const img = new Image();
    img.onload = () => {
        const s = Math.min(GRID / img.naturalWidth, GRID / img.naturalHeight, 1);
        const w = Math.max(1, Math.round(img.naturalWidth * s));
        const h = Math.max(1, Math.round(img.naturalHeight * s));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, w, h);
        const px = ctx.getImageData(0, 0, w, h).data;
        const ink = new Uint8Array(w * h);
        for (let i = 0; i < w * h; i++) ink[i] = px[i * 4 + 3] > OPAQUE ? 1 : 0;
        Object.assign(entry, { ready: true, w, h, nw: img.naturalWidth, nh: img.naturalHeight,
                               a: fillInterior(ink, w, h) });
    };
    img.src = src;
    return entry;
}

const Logo = ({ item }) => {
    const linkRef = useRef(null);
    const markRef = useRef(null);
    const mapRef = useRef(null);
    const liveRef = useRef(null);

    useEffect(() => {
        mapRef.current = alphaMapFor(item.icon);
    }, [item.icon]);

    // Written straight to the node rather than held in state: this runs on every
    // pointer move, and re-rendering the row for it would be absurd.
    // Whether this device has a pointer to track at all. Cached rather than
    // re-queried: it is read on every pointer move.
    const hoverRef = useRef(null);
    const hasHover = () => {
        if (hoverRef.current === null) {
            hoverRef.current = window.matchMedia('(hover: hover)').matches;
        }
        return hoverRef.current;
    };

    const setLive = (live) => {
        // Nothing may touch pointer-events without a hovering pointer. Guarding
        // only the initial arming was not enough: a tap emits a pointermove, and
        // then a pointerleave, so the first touch anywhere near a logo — or a
        // scroll passing over one — shut the link off and left it off. The mark
        // is a small target inside a 64px box, so a finger lands off the artwork
        // more often than not.
        if (!hasHover()) return;
        if (live === liveRef.current || !linkRef.current) return;
        liveRef.current = live;
        linkRef.current.style.pointerEvents = live ? 'auto' : 'none';
    };

    // The gate is armed from JavaScript, and only where there is a pointer to
    // track. Rendered into the HTML as `pointer-events: none`, it was permanent
    // on a phone: a tap fires no pointermove, so nothing ever switched the link
    // back on and not one of the five logos could be opened. Touch keeps the
    // whole box, which is the right target there anyway — a finger is not
    // pixel-accurate.
    useEffect(() => {
        if (!linkRef.current || !hasHover()) return;
        linkRef.current.style.pointerEvents = 'none';
        liveRef.current = false;
    }, []);

    const onMove = (e) => {
        if (!hasHover()) return;
        const map = mapRef.current;
        const mark = markRef.current;
        // Until the map has decoded, leave the whole box live — better a link
        // that is briefly too generous than one that does not work at all.
        if (!map || !map.ready || !mark) return setLive(true);

        const r = mark.getBoundingClientRect();
        if (!map.nw || !map.nh || !r.width || !r.height) return setLive(true);

        // Undo the `contain` fit — and with it any scale class, since the rect is
        // already the transformed one — to land back in the file's own pixels.
        const fit = Math.min(r.width / map.nw, r.height / map.nh);
        const x = (e.clientX - (r.left + (r.width - map.nw * fit) / 2)) / fit;
        const y = (e.clientY - (r.top + (r.height - map.nh * fit) / 2)) / fit;

        const gx = Math.round((x / map.nw) * map.w);
        const gy = Math.round((y / map.nh) * map.h);
        for (let dy = -SLACK; dy <= SLACK; dy++) {
            for (let dx = -SLACK; dx <= SLACK; dx++) {
                const px = gx + dx, py = gy + dy;
                if (px < 0 || py < 0 || px >= map.w || py >= map.h) continue;
                if (map.a[py * map.w + px]) return setLive(true);
            }
        }
        setLive(false);
    };

    // The file drives a mask over a flat fill rather than being drawn as an
    // image, which makes it behave like the `fill="currentColor"` SVGs of the
    // social links: one shape whose colour changes, so hover is a plain colour
    // transition with no half-faded intermediate state. It also replaces the old
    // `invert dark:invert-0`, since the fill already follows the text colour.
    // Every logo here is monochrome in practice — Batigère is 99% greyscale and
    // the rest are flat white — so nothing is lost by flattening them.
    const mark = (
        <span
            ref={markRef}
            aria-hidden="true"
            className={`w-full h-full block ${item.logoClass || ""}`}
            style={{
                backgroundColor: 'currentColor',
                transition: 'background-color 300ms',
                WebkitMaskImage: `url("${item.icon}")`,
                maskImage: `url("${item.icon}")`,
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskPosition: 'center',
            }}
        />
    );

    if (!item.url) {
        return <span className="w-full h-full block text-black dark:text-white">{mark}</span>;
    }

    return (
        // The box keeps its size — it is what lays the row out — but only listens.
        <span className="w-full h-full block" onPointerMove={onMove} onPointerLeave={() => setLive(false)}>
            <a
                ref={linkRef}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                // The mark is decorative now that it is a mask, so the name has
                // to live on the link itself.
                aria-label={item.title}
                className="w-full h-full flex items-center justify-center text-black dark:text-white hover:text-pink-400 dark:hover:text-pink-400 transition-colors duration-300"
            >
                {mark}
            </a>
        </span>
    );
};

// `maxWidth` is a prop rather than a hardcoded class because this row is shared
// by Work experience (3 items) and Education (2 items), which want different
// widths — Education's titles are long enough to wrap at the shared 900px.
// It is applied inline, not as `max-w-[${maxWidth}px]`: Tailwind scans source
// text statically, so a class built by interpolation is never generated.
const ExperienceRow = ({ itemsEn, itemsFr, items, maxWidth = 900 }) => {
  const locale = useLocale();
  const currentItems = itemsEn && itemsFr ? (locale === 'fr' ? itemsFr : itemsEn) : (items || []);

  return (
    <div
      style={{ maxWidth: `${maxWidth}px` }}
      // `divide-y` is gone from the stacked layout: it draws on the child's own
      // border, so the rule always ran the full width of the column and there
      // was no length to set. A short centred rule of its own instead. The
      // side-by-side layout above sm keeps divide-x, where a full-height rule
      // between columns is what you want.
      className="mx-auto flex flex-col sm:flex-row sm:divide-x divide-black/10 dark:divide-white/10"
    >
      {currentItems.map((item, index) => (
        <Fragment key={index}>
          {index > 0 && (
            <div className="sm:hidden w-24 h-px mx-auto bg-black/10 dark:bg-white/10" aria-hidden="true" />
          )}
        <div className="flex-1 flex flex-col items-center text-center py-6 sm:py-0 sm:px-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-2">
            {item.icon ? (
              <Logo item={item} />
            ) : (
              <div className="w-full h-full rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center border border-black/5">
                <span className="text-2xl font-bold text-neutral-400">{item.title.charAt(0)}</span>
              </div>
            )}
          </div>
          <h3 data-locale-fade className="text-lg font-bold text-black dark:text-white leading-snug">{item.title}</h3>
          <p data-locale-fade className="text-xs text-black dark:text-white font-medium mt-0.5">{item.date}</p>
          <p data-locale-fade className="text-sm text-neutral-700 dark:text-neutral-300 font-medium mt-2">{item.role}</p>
        </div>
        </Fragment>
      ))}
    </div>
  );
};

export default ExperienceRow;
