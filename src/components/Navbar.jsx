import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

// Runs before paint on the client, falls back to useEffect on the server where
// layout effects do not apply (and React warns about them).
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const parisFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Europe/Paris",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const HamburgerIcon = ({ isOpen }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line
      x1="3" y1="6" x2="21" y2="6"
      style={{
        transformOrigin: '12px 12px',
        transform: isOpen ? 'rotate(45deg) translateY(6px)' : 'none',
        transition: 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
      }}
    ></line>
    <line
      x1="3" y1="12" x2="21" y2="12"
      style={{
        transformOrigin: '12px 12px',
        opacity: isOpen ? 0 : 1,
        transition: 'opacity 0.2s ease',
      }}
    ></line>
    <line
      x1="3" y1="18" x2="21" y2="18"
      style={{
        transformOrigin: '12px 12px',
        transform: isOpen ? 'rotate(-45deg) translateY(-6px)' : 'none',
        transition: 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
      }}
    ></line>
  </svg>
);

export default function Navbar() {
  // Seeded with the server-rendered default rather than localStorage, for the
  // same reason as useLocale: reading the stored locale here made the first
  // client render disagree with the SSR HTML ("Voir le CV" against "View
  // resume"), which React rejects as a hydration failure and recovers from by
  // re-rendering the island. The stored value is picked up in the effect below.
  const [activeLocale, setActiveLocale] = useState('en');
  const [bubbleLocale, setBubbleLocale] = useState('en');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Seeded with the server's value, like the locale above: reading the .dark
  // class during the first render disagreed with the SSR HTML (the inline theme
  // script has already applied it by then), and React answered that hydration
  // mismatch by throwing the whole navbar away and re-rendering it. Synced in a
  // layout effect below, which lands before the browser paints — so no mismatch
  // and no flash of the wrong icon either.
  const [theme, setTheme] = useState("light");
  const [time, setTime] = useState("");
  // The wordmark→monogram transition is written straight to the DOM rather than
  // held in React state. Driving it through state re-rendered this whole
  // component on every scroll frame — reconciling the menu, the clock, every
  // icon — just to end up setting a few style properties. On a phone, where
  // Lenis is off and native scroll events come thick and fast, that reconciliation
  // was the bottleneck. Refs cost one property write per frame instead.
  const metricsRef = useRef(null);
  // Last scroll-derived progress, so a re-measure (font load, resize) can repaint
  // at the position the page is actually at rather than snapping back to 0.
  const progressRef = useRef(0);
  const axBoxRef = useRef(null);
  const axenceRef = useRef(null);
  const dRef = useRef(null);
  const ebBoxRef = useRef(null);
  const ebesRef = useRef(null);
  const brandRef = useRef(null);

  const navRef = useRef(null);
  const menuContentRef = useRef(null);
  const menuPanelRef = useRef(null);
  const [menuHeight, setMenuHeight] = useState(0);

  useIsomorphicLayoutEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  useEffect(() => {
    if (menuContentRef.current) setMenuHeight(menuContentRef.current.scrollHeight);
  }, []);

  useEffect(() => {
    // Apply the stored locale only now, once hydration has already matched.
    const stored = localStorage.getItem('locale');
    if (stored && stored !== 'en') {
      setActiveLocale(stored);
      setBubbleLocale(stored);
    }

    const handler = (e) => {
      setActiveLocale(e.detail.locale);
      setBubbleLocale(e.detail.locale);
    };
    document.addEventListener('locale-change', handler);
    return () => document.removeEventListener('locale-change', handler);
  }, []);

  useEffect(() => {
    const close = () => {
      setIsMobileMenuOpen(false);
      if (menuPanelRef.current) {
        menuPanelRef.current.style.transition = 'none';
        menuPanelRef.current.style.height = '0';
      }
    };
    document.addEventListener('astro:before-swap', close);
    return () => document.removeEventListener('astro:before-swap', close);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) setIsMobileMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const updateTime = () => setTime(parisFormatter.format(new Date()));
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Measures what the assembly needs, in px, from the type itself rather than
  // from hardcoded numbers — the wordmark is `text-lg md:text-xl`, so the font
  // size (and therefore every distance here) changes at the breakpoint. Kept in
  // a ref, not state: nothing about it needs to trigger a render.
  useEffect(() => {
    // Below the lg breakpoint the desktop links next to the wordmark are hidden,
    // so nothing sits to its right to be pushed along — narrowing the button
    // moves nothing, yet still forces a layout pass every frame. There the D
    // absorbs the collapse itself and only transforms run, which the compositor
    // handles without touching layout. Desktop keeps the real reflow, which is
    // the whole point of the effect there.
    let reflow = window.innerWidth >= 1024;

    // Chrome, Safari 26 and Firefox all animate off the scroll position itself.
    // Where that exists nothing below runs per frame; the JS path is kept only
    // as a fallback for older engines.
    const scrollDriven =
      typeof CSS !== 'undefined' && CSS.supports && CSS.supports('animation-timeline: scroll()');

    const paint = (p) => {
      const m = metricsRef.current;
      if (!m) return;

      if (reflow) {
        // The feather strip is padding, and border-box counts it inside width,
        // so it has to survive the collapse or the fade would shrink with the text.
        axBoxRef.current.style.width = `${m.axence * (1 - p) + m.feather}px`;
        ebBoxRef.current.style.width = `${m.ebes * (1 - p) + m.feather}px`;
      }
      // With the widths frozen the flow no longer carries the D leftwards, so it
      // has to cover the collapsed segment as well as the weld.
      const shift = (reflow ? m.weld : m.axence + m.weld) * p;

      // Plus the feather, for the reason given on the brand-axence keyframes.
      axenceRef.current.style.transform = `translateX(${-(m.axence + m.feather) * p}px)`;
      dRef.current.style.transform = `translateX(${-shift}px)`;
      ebBoxRef.current.style.transform = `translateX(${-shift}px)`;
      ebesRef.current.style.transform = `translateX(${-(m.ebes + m.feather) * p}px)`;
    };

    const measure = () => {
      const ax = axenceRef.current, eb = ebesRef.current;
      if (!ax || !eb) return;
      const cs = getComputedStyle(ax.parentElement);
      const fontSize = parseFloat(cs.fontSize) || 0;
      // tracking-tight is negative, and it survives once between the M and the D
      // after the segment between them has collapsed, so it counts here.
      const letterSpacing = parseFloat(cs.letterSpacing) || 0;

      // Natural widths have to be read with the boxes unconstrained. On the
      // scroll-driven path the animation itself is what constrains them, so it
      // is suspended for the read rather than the inline widths being lifted.
      const prevAx = axBoxRef.current.style.width;
      const prevEb = ebBoxRef.current.style.width;
      if (scrollDriven) brandRef.current.classList.remove('brand-morph');
      axBoxRef.current.style.width = 'auto';
      ebBoxRef.current.style.width = 'auto';
      const axW = ax.getBoundingClientRect().width;
      const ebW = eb.getBoundingClientRect().width;
      axBoxRef.current.style.width = prevAx;
      ebBoxRef.current.style.width = prevEb;

      // Crossing the breakpoint switches which technique is in use; any widths
      // written by the other one have to be cleared or they would stay frozen.
      const nextReflow = window.innerWidth >= 1024;
      if (nextReflow !== reflow) {
        reflow = nextReflow;
        if (!reflow) {
          axBoxRef.current.style.width = '';
          ebBoxRef.current.style.width = '';
        }
      }

      metricsRef.current = {
        axence: axW,
        ebes: ebW,
        // Read off the element rather than duplicated here: --brand-feather is
        // an em value, so it changes with the font size at the breakpoint.
        feather: parseFloat(getComputedStyle(axBoxRef.current).paddingLeft) || 0,
        // In Inter the M advances 1908 units and the welded D sits at 1332, so
        // the D has 576/2048 em to travel — the same offset the favicon bakes in.
        weld: (576 / 2048) * fontSize + letterSpacing,
      };

      if (scrollDriven) {
        // The distances the keyframes interpolate towards. Published once here
        // rather than written per frame; the compositor takes it from there.
        const m = metricsRef.current;
        const el = brandRef.current;
        el.style.setProperty('--brand-ax', `${m.axence}px`);
        el.style.setProperty('--brand-eb', `${m.ebes}px`);
        el.style.setProperty('--brand-shift', `${(reflow ? m.weld : m.axence + m.weld)}px`);
        // The exact distance AnimatedBackground fades over, so the two stay
        // locked together. Refreshed here, which also runs on resize.
        el.style.setProperty('--brand-range', `${window.innerHeight * 0.5}px`);
        // Inline widths would beat the width keyframes above lg, so the
        // fallback's leftovers are cleared before handing over.
        axBoxRef.current.style.width = '';
        ebBoxRef.current.style.width = '';
        el.classList.add('brand-morph');
      } else {
        paint(progressRef.current);
      }
    };

    // Measuring before Inter has loaded would size the segments from the
    // fallback face and leave the D landing short.
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    else measure();

    // Wordmark → monogram, for engines without scroll-driven animations. Driven
    // by the exact expression AnimatedBackground uses to fade itself out
    // (1 - scrollY / (innerHeight * 0.5)); deriving both from the same scroll
    // position, rather than giving this its own duration or threshold, is what
    // keeps the two genuinely in step. Throttled to one frame, since scroll
    // fires far more often than the screen refreshes.
    //
    // Where the CSS path is available none of this is registered at all: the
    // letters and the mask are both the compositor's business, and no scroll
    // handler runs on the main thread.
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const fadeDistance = window.innerHeight * 0.5;
        const p = fadeDistance > 0 ? window.scrollY / fadeDistance : 0;
        progressRef.current = Math.min(1, Math.max(0, p));
        paint(progressRef.current);
        ticking = false;
      });
    };

    if (!scrollDriven) {
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
    // Width changes only. A height-only resize is the phone's URL bar
    // retracting as the scroll starts, and iOS fires it repeatedly through that
    // animation — each one republishing --brand-range, which moves the end of
    // the range under a scroll position that has not moved. Measured against
    // the real values, an innerHeight of 700 going to 740 walks the letters
    // 0.5px at 40px of scroll and 2.4px at 200px, once per event: that is the
    // trembling, and it is confined to the start of the scroll because that is
    // when the bar retracts.
    //
    // Nothing measured here depends on the viewport height — only the range
    // does — so a height-only change has nothing to redo. This also matches
    // AnimatedBackground, whose own resize already returns early unless the
    // width moved by 50px, so its fade distance was staying put while this
    // one chased the bar: holding both still is what actually keeps the two in
    // step.
    let lastWidth = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      measure();
    };

    window.addEventListener('resize', onResize);
    return () => {
      if (!scrollDriven) window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;

    // Marks the swap for the CSS below, which stops the navbar interpolating its
    // colours.
    root.dataset.themeSwap = "";
    window.setTimeout(() => { delete root.dataset.themeSwap; }, 750);

    const apply = () => {
      setTheme(newTheme);
      if (newTheme === "dark") document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", newTheme);
    };
    // Touch devices never take the cross-fade, even where the API exists. A view
    // transition replaces the page with flat snapshots, and while one is in
    // flight the root is constrained so they can be composited: on a phone that
    // showed as the navbar blinking out — its background is nothing but a
    // backdrop-filter, and a blur has no backdrop inside a snapshot — and as the
    // page pulling back inside Safari's bars. A coarse pointer rules it out
    // rather than `(hover: none)` alone, which some touch devices contradict.
    //
    // What they get instead is the colour transition every element already
    // carries, stretched for the length of the swap. See data-theme-fallback in
    // global.css.
    const touch =
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(hover: none)").matches;

    const canCrossFade = !!document.startViewTransition && !touch;

    if (!canCrossFade) {
      root.dataset.themeFallback = "";
      apply();
      // Cleared past the 0.65s the rule above runs for.
      window.setTimeout(() => { delete root.dataset.themeFallback; }, 750);
      return;
    }
    document.documentElement.dataset.themeTransition = "";
    const t = document.startViewTransition(apply);
    const clear = () => { delete document.documentElement.dataset.themeTransition; };
    // A timer as well as the promise: an interrupted transition can leave the
    // promise unsettled, and the marker with it.
    t.finished.finally(clear);
    window.setTimeout(clear, 1500);
  };

  const handleLanguageSwitch = () => {
    const newLocale = bubbleLocale === 'en' ? 'fr' : 'en';
    setBubbleLocale(newLocale);
    if (menuPanelRef.current) {
      menuPanelRef.current.style.transition = 'none';
      menuPanelRef.current.style.height = '0';
    }
    setIsMobileMenuOpen(false);
    if (typeof window !== 'undefined' && typeof window.switchLocale === 'function') {
      window.switchLocale(newLocale);
    }
  };

  const resumeUrl = activeLocale === 'fr' ? '/Maxence_Debes_Resume_Fra.pdf' : '/Maxence_Debes_Resume_Ang.pdf';
  const resumeViewLabel = activeLocale === 'fr' ? 'Voir le CV' : 'View resume';
  const resumeDownloadLabel = activeLocale === 'fr' ? 'Télécharger le CV' : 'Download resume';

  // The padding keeps the bar's contents clear of the status bar and notch,
  // while its background — inset-0 behind it — still runs to the very top of
  // the screen.
  return (
    <nav ref={navRef} className="fixed top-0 left-0 w-full z-[90] pt-[env(safe-area-inset-top,0px)]">
      <div
        className="absolute inset-0 -z-10 backdrop-blur-sm border-b-[0.5px] border-black/10 dark:border-white/10"
        style={{ WebkitBackdropFilter: "blur(8px)", backdropFilter: "blur(8px)" }}
      />

      <div className="flex items-center justify-between px-6 py-3">
        {/* LEFT */}
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden flex items-center justify-center text-black dark:text-white cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <HamburgerIcon isOpen={isMobileMenuOpen} />
          </button>

          {/* The monogram is not a separate mark faded in over the wordmark — it
              is the wordmark, closing like a drawer. Each spare segment sits in a
              clipping box that narrows while its text slides left by the same
              amount, so the letters leave through the *left* edge and tuck behind
              the M (and the D), rather than being trimmed off their right end.
              They keep full colour throughout; nothing greys out. The D mean-
              while covers the last stretch onto the M's right stem — the offset
              the favicon bakes in so the two 307-unit stems coincide. Because the
              boxes really do lose their width, the button narrows and everything
              after it in the navbar slides left with it, rather than the bar
              holding a fixed gap. Only the button carries the accessible name;
              the pieces are hidden so a screen reader reads "Maxence Debes" once,
              not letter by letter. */}
          <button
            ref={brandRef}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-baseline text-black dark:text-white font-bold text-lg md:text-xl tracking-tight cursor-pointer transition-colors duration-300 hover:text-pink-400 whitespace-nowrap"
            aria-label="Maxence Debes"
          >
            {/* The M sits above the sliding letters so they can pass behind it. */}
            <span aria-hidden="true" className="relative z-10">M</span>
            <span
              ref={axBoxRef}
              data-brand-anim="ax-box"
              aria-hidden="true"
              style={{ display: 'inline-block', overflow: 'hidden', whiteSpace: 'pre' }}
            >
              <span ref={axenceRef} data-brand-anim="axence" style={{ display: 'inline-block' }}>axence </span>
            </span>
            <span
              ref={dRef}
              data-brand-anim="d"
              aria-hidden="true"
              className="relative z-10"
              style={{ display: 'inline-block' }}
            >D</span>
            <span
              ref={ebBoxRef}
              data-brand-anim="eb-box"
              aria-hidden="true"
              style={{ display: 'inline-block', overflow: 'hidden', whiteSpace: 'pre' }}
            >
              <span ref={ebesRef} data-brand-anim="ebes" style={{ display: 'inline-block' }}>ebes</span>
            </span>
          </button>

          <div className="hidden lg:flex items-center gap-4">
            <div className="w-[1px] h-4 bg-black/30 dark:bg-white/30"></div>
            <span className="flex items-center gap-1.5 text-sm font-semibold tracking-wide text-black dark:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              Paris - {time}
            </span>
            <div className="w-[1px] h-4 bg-black/30 dark:bg-white/30"></div>
            <a data-locale-fade href={resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm font-semibold tracking-wide text-black dark:text-white hover:text-pink-400 dark:hover:text-pink-400 transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              {resumeViewLabel}
            </a>
            <div data-locale-fade className="w-[1px] h-4 bg-black/30 dark:bg-white/30"></div>
            <a data-locale-fade href={resumeUrl} download className="flex items-center gap-1.5 text-sm font-semibold tracking-wide text-black dark:text-white hover:text-pink-400 dark:hover:text-pink-400 transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              {resumeDownloadLabel}
            </a>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3 md:gap-5 lg:gap-6">
          {/* Lang toggle */}
          <div className="hidden lg:flex items-center gap-2" role="group" aria-label="Switch language">
            {['en', 'fr'].map((code, index) => (
              // React.Fragment, not <>, because a shorthand fragment can't take
              // a key — and without one React can't tell these two rows apart.
              <React.Fragment key={code}>
                {index > 0 && <div className="w-[1px] h-4 bg-black/30 dark:bg-white/30"></div>}
                <button
                  onClick={bubbleLocale === code ? undefined : handleLanguageSwitch}
                  className={`text-sm font-medium tracking-wide cursor-pointer transition-colors duration-300 ${
                    bubbleLocale === code ? 'text-pink-400' : 'text-black dark:text-white hover:text-pink-400 dark:hover:text-pink-400'
                  }`}
                >
                  {code.toUpperCase()}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="relative w-[18px] h-[18px] text-black dark:text-white hover:text-pink-400 dark:hover:text-pink-400 cursor-pointer transition-colors duration-300 flex items-center justify-center"
            aria-label="Toggle theme"
          >
            {/* The icon names what the click will do, not what the page
                currently is: at night you are offered the sun. It used to show
                the state instead, so dark mode displayed a moon — a label for
                something you were already looking at. */}
            <span
              className="absolute inset-0 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
              style={{
                opacity: theme === 'dark' ? 1 : 0,
                transform: theme === 'dark' ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0.5)',
              }}
            >
              <SunIcon />
            </span>
            <span
              className="absolute inset-0 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
              style={{
                opacity: theme === 'dark' ? 0 : 1,
                transform: theme === 'dark' ? 'rotate(-90deg) scale(0.5)' : 'rotate(0deg) scale(1)',
              }}
            >
              <MoonIcon />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <div
        ref={menuPanelRef}
        // Only while open. Collapsed, the panel sits flush under the navbar with
        // no height, so its bottom border landed on the navbar's own — two
        // hairlines drawing one line, and the bar's edge reading twice as thick
        // as it should. Closed there is now a single rule; open there is one at
        // each edge of the panel.
        className={`lg:hidden absolute left-0 right-0 top-full overflow-hidden ${
          isMobileMenuOpen ? "border-b-[0.5px] border-black/10 dark:border-white/10" : ""
        }`}
        style={{
          height: isMobileMenuOpen ? menuHeight : 0,
          transition: 'height 0.35s cubic-bezier(0.22,1,0.36,1)',
          WebkitBackdropFilter: 'blur(8px)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div ref={menuContentRef}>
          {/* No border-t here: the navbar's own bottom border already draws that
                line, and the panel opens flush beneath it. Carrying one as well
                stacked a 1px rule on top of that 0.5px one, so opening the menu
                appeared to thicken the navbar's edge. */}
            <div className="px-6 pt-3 pb-5 flex flex-col">
            <a
              data-locale-fade
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 py-3 text-sm font-semibold text-black dark:text-white hover:text-pink-400 dark:hover:text-pink-400 transition-colors duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              {resumeViewLabel}
            </a>
            <a
              data-locale-fade
              href={resumeUrl}
              download
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 py-3 text-sm font-semibold text-black dark:text-white hover:text-pink-400 dark:hover:text-pink-400 transition-colors duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              {resumeDownloadLabel}
            </a>
            <div className="mt-2 pt-3 border-t border-black/8 dark:border-white/8 flex gap-2">
              {['en', 'fr'].map((code) => (
                <button
                  key={code}
                  onClick={bubbleLocale === code ? () => setIsMobileMenuOpen(false) : handleLanguageSwitch}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    bubbleLocale === code ? 'bg-pink-400 text-white' : 'text-black dark:text-white hover:text-pink-400 dark:hover:text-pink-400'
                  }`}
                >
                  {code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
