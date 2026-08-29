import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const isPinkish = (rgb) => {
    const m = rgb && rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    return m && +m[1] > 180 && +m[2] < 150 && +m[3] > 100 && +m[1] > +m[2] + 60;
};

const isPinkElement = (el) => {
    let node = el;
    while (node && node !== document.body) {
        if (node.classList) {
            const classes = [...node.classList];
            if (classes.some(c =>
                c === "filter-btn" ||
                c === "carousel-dot" ||
                c.startsWith("bg-pink") ||
                c.startsWith("text-pink") ||
                c.startsWith("border-pink") ||
                c.startsWith("hover:bg-pink") ||
                c.startsWith("hover:text-pink")
            )) return true;
        }
        const style = window.getComputedStyle(node);
        if (isPinkish(style.backgroundColor) || isPinkish(style.color) || isPinkish(style.borderTopColor)) return true;
        node = node.parentElement;
    }
    return false;
};

const DOT_R = 2;
// Half the resting ring below, so the pink sampling keeps probing the ring's own
// edge rather than a circle that no longer exists.
const RING_R = 10;
const OFFSETS = [[0, 0], [DOT_R, 0], [-DOT_R, 0], [0, DOT_R], [0, -DOT_R], [RING_R, 0], [-RING_R, 0], [0, RING_R], [0, -RING_R]];

export default function CustomCursor() {
    // Two full cursor layers, not one that switches blend mode. Mutating
    // `mix-blend-mode` on a live element makes the browser tear down and
    // rebuild its compositing layer, which drops a frame — the cursor visibly
    // blinked out at the exact moment the look changed. Since the ring samples
    // 12px ahead of the pointer, that moment lands just *before* you reach a
    // button, which is why it read as "disappears on approach". Each layer now
    // keeps a fixed blend mode for its whole life and we cross-fade opacity
    // between them instead; opacity never rebuilds the layer, so nothing blinks.
    const cursorBlendRef = useRef(null);
    const followerBlendRef = useRef(null);
    const cursorSolidRef = useRef(null);
    const followerSolidRef = useRef(null);

    useEffect(() => {
        // Same widened test as Lenis: `(hover: none)` alone let this run on
        // touch devices that claim hover, where a custom cursor is pure waste.
        if (window.matchMedia('(pointer: coarse)').matches) return;
        if (window.matchMedia('(hover: none)').matches) return;

        const cursorBlend = cursorBlendRef.current;
        const followerBlend = followerBlendRef.current;
        const cursorSolid = cursorSolidRef.current;
        const followerSolid = followerSolidRef.current;

        const cursors = [cursorBlend, cursorSolid];
        const followers = [followerBlend, followerSolid];
        const all = [...cursors, ...followers];

        let mouseX = 0, mouseY = 0, posX = 0, posY = 0;
        let hovering = false;
        let onPink = false;
        let exitPinkTimer = null;
        let visible = false;

        const isDarkRef = { current: document.documentElement.classList.contains("dark") };

        const paintSolid = () => {
            const color = isDarkRef.current ? "#ffffff" : "#000000";
            gsap.set(cursorSolid, { backgroundColor: color });
            gsap.set(followerSolid, { borderColor: color });
        };

        const obs = new MutationObserver(() => {
            const nowDark = document.documentElement.classList.contains("dark");
            if (nowDark === isDarkRef.current) return;
            isDarkRef.current = nowDark;
            // Only the solid layer reads the theme — difference blending is
            // self-inverting — but repaint it even while hidden so it is
            // already correct the next time it fades in.
            paintSolid();
        });
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

        gsap.set(all, { xPercent: -50, yPercent: -50, opacity: 0 });
        // Ring diameters, resting and over something clickable. Declared once
        // here so the initial size and the hover tween cannot drift apart.
        const RING = 20;
        const RING_HOVER = 26;
        gsap.set(followers, { width: RING, height: RING });
        gsap.set([cursorBlend, followerBlend], { mixBlendMode: "difference" });
        gsap.set([cursorSolid, followerSolid], { mixBlendMode: "normal" });
        gsap.set(cursorBlend, { backgroundColor: "#ffffff" });
        gsap.set(followerBlend, { borderColor: "#ffffff" });
        paintSolid();

        // Size and look are applied independently on purpose. They used to be
        // one combined state ("hover-pink", "default-pink", ...), so any flicker
        // in the pink test also re-fired the follower's 0.3s resize tween — the
        // pointer only had to hover near a pink edge for the ring to pump. The
        // two now only react to the input that actually concerns them.
        const applySize = () => {
            const size = hovering ? RING_HOVER : RING;
            gsap.to(followers, { width: size, height: size, duration: 0.3, ease: "power2.out" });
        };

        const applyLook = () => {
            if (!visible) return;
            gsap.set([cursorBlend, followerBlend], { opacity: onPink ? 0 : 1 });
            gsap.set([cursorSolid, followerSolid], { opacity: onPink ? 1 : 0 });
        };

        // The clickable/pink hit-testing below is heavy — up to 9 elementFromPoint
        // calls plus getComputedStyle tree-walks. Running it on every mousemove
        // event (which can fire 120+/s and stack several per frame) did a lot of
        // synchronous style work that janked scrolling and animations. It's now
        // driven from the rAF loop, at most once per frame and only when the
        // pointer actually moved. The result is identical; it just runs far less.
        const updateCursorState = () => {
            const centerEl = document.elementFromPoint(mouseX, mouseY);
            if (!centerEl || all.includes(centerEl)) return;

            const isClickable =
                centerEl.tagName === "A" || centerEl.tagName === "BUTTON" ||
                centerEl.closest?.("a") || centerEl.closest?.("button") ||
                centerEl.classList?.contains("cursor-pointer") || centerEl.closest?.(".cursor-pointer");
            const isNoHighlight =
                centerEl.classList?.contains("no-cursor-highlight") || centerEl.closest?.(".no-cursor-highlight");
            const clickable = isClickable && !isNoHighlight;

            // Check all 9 points (centre + dot edge + ring edge) for pink
            let pink = false;
            for (const [dx, dy] of OFFSETS) {
                const el = dx === 0 && dy === 0 ? centerEl : document.elementFromPoint(mouseX + dx, mouseY + dy);
                if (el && !all.includes(el) && isPinkElement(el)) { pink = true; break; }
            }

            // Size: driven by the single centre hit-test, which only flips when
            // the pointer genuinely crosses an element edge. Stable, so it is
            // applied immediately — the grow tracks the pointer with no lag.
            if (clickable !== hovering) {
                hovering = clickable;
                applySize();
            }

            // Look: asymmetric hysteresis. Entering pink applies at once,
            // because any frame spent blending over pink shows the inverted
            // colour (difference over this site's pink lands on green). Leaving
            // pink waits, because the 9-point ring sample sits a pixel or two
            // from every pink edge and ordinary hand tremor flips it back and
            // forth; holding the pink look through that wobble is invisible,
            // whereas reverting on each flip is the green flicker. The delay
            // outlasts a tremor cycle (~80-120ms) rather than the old 30ms,
            // which was short enough for the flicker to get through.
            if (pink) {
                if (exitPinkTimer) { clearTimeout(exitPinkTimer); exitPinkTimer = null; }
                if (!onPink) { onPink = true; applyLook(); }
            } else if (onPink && !exitPinkTimer) {
                exitPinkTimer = setTimeout(() => {
                    exitPinkTimer = null;
                    onPink = false;
                    applyLook();
                }, 150);
            }
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
                gsap.set(cursors, { x: mouseX, y: mouseY });
                gsap.set(followers, { x: posX, y: posY });
                applyLook();
            }

            gsap.to(cursors, { x: mouseX, y: mouseY, duration: 0.1, ease: "power2.out" });
            moved = true;
        };

        const loop = () => {
            posX += (mouseX - posX) / 8;
            posY += (mouseY - posY) / 8;
            gsap.set(followers, { x: posX, y: posY });
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
            gsap.set(all, { opacity: 0 });
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
            if (exitPinkTimer) clearTimeout(exitPinkTimer);
            document.head.removeChild(styleEl);
        };
    }, []);

    return (
        <>
            <div
                ref={cursorBlendRef}
                className="fixed top-0 left-0 w-[3px] h-[3px] rounded-full pointer-events-none z-[9999] hidden md:block"
            />
            <div
                ref={followerBlendRef}
                className="fixed top-0 left-0 border rounded-full pointer-events-none z-[9998] hidden md:block box-border"
            />
            <div
                ref={cursorSolidRef}
                className="fixed top-0 left-0 w-[3px] h-[3px] rounded-full pointer-events-none z-[9999] hidden md:block"
            />
            <div
                ref={followerSolidRef}
                className="fixed top-0 left-0 border rounded-full pointer-events-none z-[9998] hidden md:block box-border"
            />
        </>
    );
}
