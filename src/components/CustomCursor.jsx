import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function CustomCursor() {
    const cursorRef = useRef(null);
    const followerRef = useRef(null);

    useEffect(() => {
        if (window.matchMedia('(hover: none)').matches) return;

        const cursor = cursorRef.current;
        const follower = followerRef.current;

        // Solid, theme-matched colour — deliberately NOT mix-blend-mode.
        // `difference` blending inverts whatever is underneath, and inverting
        // this site's pink (219,39,119) lands on green (36,216,136) — that was
        // the green flash over pink links/buttons. The old fix sampled 9 points
        // around the pointer to detect "am I over something pink" and switched
        // blending off just in time; that sampling was a pixel or two from every
        // boundary, so it flickered, and debouncing it only traded the flicker
        // for a visible green window plus laggy hover growth. Dropping blending
        // altogether removes the green at its source and makes the whole
        // detection layer (and its debounce) unnecessary.
        const colorFor = (dark) => (dark ? "#ffffff" : "#000000");
        // A hairline halo in the opposite colour keeps the cursor legible over
        // the few surfaces that match its own colour (the hero photo, the
        // black-filtered project logos) — the one thing blending gave for free.
        const haloFor = (dark) => `0 0 0 1px ${dark ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.55)"}`;

        let isDark = document.documentElement.classList.contains("dark");

        const paint = () => {
            gsap.set(cursor, { backgroundColor: colorFor(isDark), boxShadow: haloFor(isDark) });
            gsap.set(follower, { borderColor: colorFor(isDark), boxShadow: haloFor(isDark) });
        };

        const obs = new MutationObserver(() => {
            const nowDark = document.documentElement.classList.contains("dark");
            if (nowDark === isDark) return;
            isDark = nowDark;
            paint();
        });
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

        gsap.set(cursor, { xPercent: -50, yPercent: -50, opacity: 0 });
        gsap.set(follower, { xPercent: -50, yPercent: -50, opacity: 0, width: 24, height: 24 });
        paint();

        let mouseX = 0, mouseY = 0, posX = 0, posY = 0;
        let hovering = false;
        let visible = false;

        // Hit-testing is a single elementFromPoint at the pointer itself, so it
        // flips only when the pointer genuinely crosses an element edge — no
        // ring sampling, no jitter, and therefore no debounce needed. The grow
        // reacts immediately instead of pumping.
        const updateCursorState = () => {
            const el = document.elementFromPoint(mouseX, mouseY);
            if (!el || el === cursor || el === follower) return;

            const clickable = !!(
                (el.tagName === "A" || el.tagName === "BUTTON" ||
                    el.closest?.("a") || el.closest?.("button") ||
                    el.classList?.contains("cursor-pointer") || el.closest?.(".cursor-pointer")) &&
                !(el.classList?.contains("no-cursor-highlight") || el.closest?.(".no-cursor-highlight"))
            );

            if (clickable === hovering) return;
            hovering = clickable;
            gsap.to(follower, {
                width: clickable ? 40 : 24,
                height: clickable ? 40 : 24,
                duration: 0.3,
                ease: "power2.out",
            });
        };

        let moved = false;
        const onMouseMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            // Reveal on the first move rather than only on `mouseenter`: when the
            // pointer is already inside the page as it loads (or as this component
            // remounts), no mouseenter ever fires and the cursor would stay hidden
            // until you left and re-entered the window. Snap to the pointer first
            // so it doesn't fly in from the top-left corner.
            if (!visible) {
                visible = true;
                posX = mouseX;
                posY = mouseY;
                gsap.set(cursor, { x: mouseX, y: mouseY });
                gsap.set(follower, { x: posX, y: posY });
                gsap.set([cursor, follower], { opacity: 1 });
            }

            gsap.to(cursor, { x: mouseX, y: mouseY, duration: 0.1, ease: "power2.out" });
            moved = true;
        };

        const loop = () => {
            posX += (mouseX - posX) / 8;
            posY += (mouseY - posY) / 8;
            gsap.set(follower, { x: posX, y: posY });
            if (moved) { moved = false; updateCursorState(); }
            requestAnimationFrame(loop);
        };
        loop();

        window.addEventListener("mousemove", onMouseMove, { passive: true });

        // `mouseleave` on `document` also fires when a hovered element's
        // transform changes underneath the pointer, a browser hit-testing quirk.
        // `relatedTarget` is null only on a real exit to another window/app.
        const onMouseLeave = (e) => {
            if (e.relatedTarget !== null) return;
            visible = false;
            gsap.set([cursor, follower], { opacity: 0 });
        };
        // Re-entering only arms the reveal; the mousemove that follows snaps the
        // cursor to the pointer and shows it, so it never flashes at a stale spot.
        const onMouseEnter = () => { visible = false; };
        document.addEventListener("mouseleave", onMouseLeave);
        document.addEventListener("mouseenter", onMouseEnter);

        const styleEl = document.createElement("style");
        styleEl.textContent = "* { cursor: none !important; }";
        document.head.appendChild(styleEl);

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseleave", onMouseLeave);
            document.removeEventListener("mouseenter", onMouseEnter);
            obs.disconnect();
            document.head.removeChild(styleEl);
        };
    }, []);

    return (
        <>
            <div
                ref={cursorRef}
                className="fixed top-0 left-0 w-[3px] h-[3px] rounded-full pointer-events-none z-[9999] hidden md:block"
            />
            <div
                ref={followerRef}
                className="fixed top-0 left-0 border rounded-full pointer-events-none z-[9998] hidden md:block box-border"
            />
        </>
    );
}
