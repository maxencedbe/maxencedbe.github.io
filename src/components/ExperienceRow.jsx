import { Fragment, useEffect, useRef } from 'react';
import { useLocale } from './useLocale.js';

// Alpha map per logo, decoded once and shared by every row that uses the file.
// Even cropped to their artwork the logos are mostly holes and gaps between
// letters — Télécom SudParis's ink covers 42% of its box. A link the size of
// the box is therefore largely empty space, which is what made the cursor turn
// into a hand well away from the mark.
const alphaMaps = new Map();

// Sampling grid. Small on purpose: this only decides whether a point is on the
// artwork, so a 96px map is ample and costs ~9KB per logo.
const GRID = 96;
// Slack in grid cells, so thin strokes and the gaps inside a letterform stay
// comfortably clickable rather than demanding pixel accuracy.
const SLACK = 2;
// A second, wider look. Ink inside SLACK means the pointer is on the artwork.
// Ink between SLACK and GRAZE means it is at the edge of a stroke, where the
// per-pixel answer flips between samples — that case waits before switching
// off. No ink even within GRAZE means the pointer has genuinely left, and
// there is nothing to protect against, so it switches off at once.
const GRAZE = 7;
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
    const boxRef = useRef(null);
    const offTimer = useRef(null);
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

    // One state drives both halves of the response. The pointer turns into a
    // hand only where the link is hittable — so anything that lights the colour
    // on a different signal shows the hand at one moment and colours the logo at
    // another. They share this one.
    const commit = (live) => {
        if (live === liveRef.current || !linkRef.current) return;
        liveRef.current = live;
        linkRef.current.style.pointerEvents = live ? 'auto' : 'none';
        const box = boxRef.current;
        if (!box) return;
        if (live) box.setAttribute('data-lit', '');
        else box.removeAttribute('data-lit');
    };

    const setLive = (live, now = false) => {
        // Nothing may touch pointer-events without a hovering pointer. Guarding
        // only the initial arming was not enough: a tap emits a pointermove, and
        // then a pointerleave, so the first touch anywhere near a logo — or a
        // scroll passing over one — shut the link off and left it off. The mark
        // is a small target inside its box, so a finger lands off the artwork
        // more often than not.
        if (!hasHover()) return;
        if (offTimer.current) { clearTimeout(offTimer.current); offTimer.current = null; }
        if (live || now) return commit(live);
        // Switching off waits a moment. The test is per pixel, so a pointer
        // crossing a thin stroke — the X's strokes, the small caps under it —
        // falls off the artwork between two samples and comes straight back. Run
        // bare, that flipped the link, the cursor and the colour several times a
        // second. The delay outlasts the gap without being long enough to feel.
        offTimer.current = setTimeout(() => { offTimer.current = null; commit(false); }, 140);
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
        return () => { if (offTimer.current) clearTimeout(offTimer.current); };
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
        let grazing = false;
        for (let dy = -GRAZE; dy <= GRAZE; dy++) {
            for (let dx = -GRAZE; dx <= GRAZE; dx++) {
                const px = gx + dx, py = gy + dy;
                if (px < 0 || py < 0 || px >= map.w || py >= map.h) continue;
                if (!map.a[py * map.w + px]) continue;
                if (Math.abs(dx) <= SLACK && Math.abs(dy) <= SLACK) return setLive(true);
                grazing = true;
            }
        }
        setLive(false, !grazing);
    };

    // A file drives a mask over a flat fill rather than being drawn as an image,
    // which makes it behave like the `fill="currentColor"` SVGs of the social
    // links: a shape whose colour follows the text, with no half-faded
    // intermediate state. It also replaces the old `invert dark:invert-0`.
    //
    // At rest that is still the whole story — every logo reads as one flat mark
    // in the theme's colour. What hover changes is split across two masks, both
    // fitted to the box the same way (`contain`, centred) so they register:
    //
    //   neutral   the parts of the logo that are black, white or grey. Always on
    //             currentColor, because a brand's black frame has to become white
    //             on a dark page — that is what its own charter asks for. Absent
    //             for a logo with no neutral parts.
    //   chroma    the coloured parts. One mask whose fill travels from
    //             currentColor to the brand's own colour, which every one of
    //             these five has exactly one of.
    //
    // Nothing is layered over anything and nothing fades. Two earlier attempts
    // did, and each had its own artefact. Cross-fading a colour copy over a flat
    // one dipped the combined alpha at the midpoint, washing the mark out. Fading
    // the colour copy in over an opaque flat one fixed that, but a mask and a
    // background-image are rasterised by different paths, so their edges landed a
    // fraction of a pixel apart and the mark looked briefly bold, blue bleeding
    // out past black. A single mask changing colour cannot do either: there is
    // one shape, one set of edges, and only the fill interpolates.
    //
    // Without a colour file this collapses back to the plain mask, and hover
    // stays the pink the rest of the site uses.
    const fit = {
        position: 'absolute',
        inset: 0,
        WebkitMaskSize: 'contain', maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center', maskPosition: 'center',
    };
    const maskOf = (src) => ({ WebkitMaskImage: `url("${src}")`, maskImage: `url("${src}")` });

    // A mark with no brand colour can instead name a second file to change
    // into on hover (`iconHover`) — for the Lycée Fabert, the same shield with
    // its light and dark halves swapped. The two cross over quickly, and the
    // colour stays the theme's, since the change itself is the feedback.
    const mark = item.iconHover ? (
        <span ref={markRef} aria-hidden="true" className={`relative block w-full h-full ${item.logoClass || ""}`}>
            <span
                className="bg-current transition-opacity duration-200 group-data-[lit]:opacity-0"
                style={{ ...fit, ...maskOf(item.icon) }}
            />
            <span
                className="bg-current opacity-0 transition-opacity duration-200 group-data-[lit]:opacity-100"
                style={{ ...fit, ...maskOf(item.iconHover) }}
            />
        </span>
    ) : item.iconColour ? (
        <span ref={markRef} aria-hidden="true" className={`relative block w-full h-full ${item.logoClass || ""}`}>
            {item.iconNeutral && (
                <span style={{ ...fit, ...maskOf(item.iconNeutral), backgroundColor: 'currentColor' }} />
            )}
            <span
                // bg-current rather than an inline fill: an inline style would
                // outrank the class that swaps the colour in.
                // Quicker leaving than arriving. A transition takes the duration of the
                // state it moves *to*, so the base value is the one that runs on the way
                // back: colour arrives over 300ms, which reads as deliberate, and clears
                // in 150, which stops the logo trailing behind the pointer.
                className="bg-current transition-colors duration-150 group-data-[lit]:duration-300 group-data-[lit]:bg-[var(--logo-colour)]"
                style={{ ...fit, ...maskOf(item.iconColour), '--logo-colour': item.colour }}
            />
        </span>
    ) : (
        <span
            ref={markRef}
            aria-hidden="true"
            className={`w-full h-full block ${item.logoClass || ""}`}
            style={{ ...fit, ...maskOf(item.icon), position: 'static',
                     backgroundColor: 'currentColor', transition: 'background-color 300ms' }}
        />
    );

    if (!item.url) {
        return <span className="w-full h-full block text-black dark:text-white">{mark}</span>;
    }

    // With a colour file the neutral layer must keep following the theme on
    // hover, so the link may not go pink — the colour itself is the feedback.
    const pinkOnHover = item.iconColour || item.iconHover ? '' : 'hover:text-pink-400 dark:hover:text-pink-400';

    // Lighting the colour up is not the same question as deciding what is
    // clickable, and tying them together was what made the logos flicker. The
    // click target is the artwork alone, tested per pixel, and that test flips
    // `pointer-events` — which takes `:hover` with it. Running the colour off
    // `:hover` therefore made it blink on and off wherever the pointer grazed a
    // thin stroke, restarting a 300ms fade each time.
    //
    // The box is crossed once, so it is a steady signal: entering it lights the
    // colour, leaving it puts the colour away. Precision still governs the link.
    return (
        // The box keeps its size — it is what lays the row out — but only listens.
        <span
            ref={boxRef}
            className="group w-full h-full block"
            onPointerMove={onMove}
            onPointerLeave={() => setLive(false, true)}
        >
            <a
                ref={linkRef}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                // The mark is decorative now that it is a mask, so the name has
                // to live on the link itself.
                aria-label={item.title}
                className={`w-full h-full flex items-center justify-center text-black dark:text-white transition-colors duration-300 ${pinkOnHover}`}
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
// Every logo is drawn at the same area rather than fitted into the same box.
// A shared square let the wide wordmarks fill its width and the tall crests its
// height, so Atos came out 26px tall beside a 96px Polytechnique. Equal area is
// the usual way to make marks of different shapes weigh the same: with `side`
// the edge of the square of that area and r = sqrt(width / height), a logo is
// side × r wide and side / r tall. The files are cropped to their artwork, so
// that box is the mark itself and the gap below it is the gap the eye sees.
// The logos of a row sit on a common baseline at the foot of a slot as tall as
// the tallest of them, so the titles beneath line up across the columns.
// `logoScale` enlarges a whole row past that. Equal area is only a start: a
// tall crest spends its area on height and on small print, and at the same
// area as the wordmarks the school logos still read as the smaller ones.
// An item's own `scale` corrects a single mark the same way — Atos is set in
// heavy solid letters, so at the shared area it outweighs the outlined ones.
const ExperienceRow = ({ itemsEn, itemsFr, items, maxWidth = 900, logoScale = 1 }) => {
  const locale = useLocale();
  const currentItems = itemsEn && itemsFr ? (locale === 'fr' ? itemsFr : itemsEn) : (items || []);
  const rootOf = (item) => Math.sqrt(item.icon && item.ratio ? item.ratio : 1);
  const sizeOf = (item) => logoScale * (item.scale || 1);
  const slotHeight = `calc(var(--logo-side) * ${Math.max(...currentItems.map((item) => sizeOf(item) / rootOf(item)))})`;

  return (
    <div
      style={{ maxWidth: `${maxWidth}px` }}
      // `divide-y` is gone from the stacked layout: it draws on the child's own
      // border, so the rule always ran the full width of the column and there
      // was no length to set. A short centred rule of its own instead. The
      // side-by-side layout above sm keeps divide-x, where a full-height rule
      // between columns is what you want.
      // --logo-side is the edge of the square whose area every logo matches.
      className="mx-auto flex flex-col sm:flex-row sm:divide-x divide-black/20 dark:divide-white/20 [--logo-side:50px] sm:[--logo-side:60px]"
    >
      {currentItems.map((item, index) => (
        <Fragment key={index}>
          {index > 0 && (
            <div className="sm:hidden w-24 h-px mx-auto bg-black/20 dark:bg-white/20" aria-hidden="true" />
          )}
        <div className="flex-1 flex flex-col items-center text-center py-6 sm:py-0 sm:px-8">
          <div className="flex items-end justify-center mb-7" style={{ height: slotHeight }}>
            {item.icon ? (
              <div style={{ width: `calc(var(--logo-side) * ${sizeOf(item) * rootOf(item)})`, height: `calc(var(--logo-side) * ${sizeOf(item) / rootOf(item)})` }}>
                <Logo item={item} />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center border border-black/5">
                <span className="text-2xl font-bold text-neutral-400">{item.title.charAt(0)}</span>
              </div>
            )}
          </div>
          <h3 data-locale-fade className="text-lg font-bold text-black dark:text-white leading-snug">{item.title}</h3>
          <p data-locale-fade className="text-xs text-black dark:text-white font-medium mt-0.5">{item.date}</p>
          <p data-locale-fade className="text-sm text-neutral-700 dark:text-neutral-300 font-medium mt-2">
            {item.role}
            {/* A distinction belongs on the degree it qualifies, set apart in
                italics — the usual setting for one — rather than on a line of its
                own. Bold made it outweigh the school's name above it. */}
            {item.honours && <>, <span className="italic">{item.honours}</span></>}
          </p>
        </div>
        </Fragment>
      ))}
    </div>
  );
};

export default ExperienceRow;
