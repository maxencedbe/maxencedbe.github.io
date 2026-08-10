import React, { useEffect, useRef, useState } from "react";

const STROKE = 3.5;
const SNAKE = 500;
// Match the site's pink per mode: the deeper rose of the ivory light palette,
// the vivid candy pink on dark. Read from the `.dark` class rather than the CSS
// var so the canvas never has to parse an oklch() fillStyle (spotty support).
const pinkForMode = () =>
    document.documentElement.classList.contains("dark") ? "#f472b6" : "#db2777";

function drawSnake(canvas, progress) {
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    const dpr = window.devicePixelRatio || 1;
    const t = Math.max(1, Math.round(STROKE * dpr));

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = pinkForMode();

    const perimeter = 2 * (w + h);
    const snakeEnd = progress * perimeter;
    const snakeStart = Math.max(0, snakeEnd - SNAKE * dpr);

    const sides = [
        [w, (a, b) => ctx.fillRect(Math.round(a), 0, Math.round(b) - Math.round(a), t)],
        [h, (a, b) => ctx.fillRect(w - t, Math.round(a), t, Math.round(b) - Math.round(a))],
        [w, (a, b) => ctx.fillRect(Math.round(w - b), h - t, Math.round(w - a) - Math.round(w - b), t)],
        [h, (a, b) => ctx.fillRect(0, Math.round(h - b), t, Math.round(h - a) - Math.round(h - b))],
    ];

    let pos = 0;
    for (const [len, fill] of sides) {
        const a = Math.max(snakeStart - pos, 0);
        const b = Math.min(snakeEnd - pos, len);
        if (b > a) fill(a, b);
        pos += len;
    }
}

function easeInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function ProgressBar() {
    const canvasRef = useRef(null);
    const [dims, setDims] = useState({ w: 0, h: 0, dpr: 1 });
    const stateRef = useRef({ current: 0, animRaf: null, scrollRaf: null, localeChanging: false, animatingFromLocale: false });

    useEffect(() => {
        const update = () =>
            setDims({
                w: document.documentElement.clientWidth,
                h: window.innerHeight,
                dpr: window.devicePixelRatio || 1,
            });
        window.addEventListener("resize", update);
        update();
        return () => window.removeEventListener("resize", update);
    }, []);

    // Redraw at the current progress whenever the canvas is resized. Deliberately
    // its own effect, separate from the one below: a resize mid-transition (e.g. a
    // scrollbar toggling because EN/FR text has a different total page height)
    // must never tear down and rebuild the scroll/locale listeners below, since
    // that cancels an in-flight glide animation and freezes the bar mid-slide —
    // it then only "catches up" instantly on the next scroll, i.e. it teleports.
    useEffect(() => {
        if (canvasRef.current) drawSnake(canvasRef.current, stateRef.current.current);
    }, [dims]);

    useEffect(() => {
        const state = stateRef.current;

        const getProgress = () => {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (docHeight <= 0) return 0;
            return Math.min(Math.max(window.scrollY / docHeight, 0), 1);
        };

        const drawCurrent = () => {
            if (state.scrollRaf) cancelAnimationFrame(state.scrollRaf);
            state.scrollRaf = requestAnimationFrame(() => {
                const progress = getProgress();
                state.current = progress;
                if (canvasRef.current) drawSnake(canvasRef.current, progress);
            });
        };

        const handleScroll = () => {
            // Ignore scroll events fired by the locale switch scroll correction.
            // Also ignore while a locale-triggered glide is in flight: the native
            // 'scroll' event from switchLocale's own corrective scrollBy can arrive
            // asynchronously, sometimes right as (or just after) the glide starts —
            // if it weren't ignored here it would cancel the animation and snap the
            // bar straight to its target, which is what a "teleport" actually was.
            if (state.localeChanging || state.animatingFromLocale) return;
            if (state.animRaf) { cancelAnimationFrame(state.animRaf); state.animRaf = null; }
            drawCurrent();
        };

        const handleLocaleChange = () => {
            state.localeChanging = true;
        };

        // Fired by switchLocale once the scroll-position correction has
        // landed — glide the bar to its new target from here, in sync with
        // the content fading back in, instead of a fixed delay that drifts
        // out of sync whenever the transition's own timing changes.
        const handleLocaleSettle = () => {
            state.localeChanging = false;
            state.animatingFromLocale = true;
            animateTo(getProgress(), () => { state.animatingFromLocale = false; });
        };

        // Animated glide when page expands (show more — progress drops suddenly)
        const animateTo = (target, onComplete) => {
            if (state.animRaf) cancelAnimationFrame(state.animRaf);
            const start = state.current;
            const startTime = performance.now();
            const duration = 700;

            const step = (now) => {
                const t = Math.min((now - startTime) / duration, 1);
                state.current = start + (target - start) * easeInOut(t);
                if (canvasRef.current) drawSnake(canvasRef.current, state.current);
                if (t < 1) {
                    state.animRaf = requestAnimationFrame(step);
                } else {
                    state.current = target;
                    state.animRaf = null;
                    if (onComplete) onComplete();
                }
            };
            state.animRaf = requestAnimationFrame(step);
        };

        let lastDocHeight = document.documentElement.scrollHeight - window.innerHeight;
        const handleResize = () => {
            const newDocHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (state.localeChanging) { lastDocHeight = newDocHeight; return; }
            const delta = newDocHeight - lastDocHeight;
            lastDocHeight = newDocHeight;

            if (Math.abs(delta) > 20) {
                // Page expanded or shrank (show more, filter change): animate the bar smoothly
                animateTo(getProgress());
            } else {
                // Negligible change: track instantly so state.current stays
                // in sync — prevents teleport if the user scrolls right after collapse
                drawCurrent();
            }
        };

        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(document.body);
        // Redraw when the theme toggles so the bar swaps to the mode's pink at once.
        const themeObserver = new MutationObserver(drawCurrent);
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        window.addEventListener("scroll", handleScroll, { passive: true });
        document.addEventListener("astro:after-swap", handleScroll);
        document.addEventListener("locale-change", handleLocaleChange);
        document.addEventListener("locale-transition-settle", handleLocaleSettle);

        setTimeout(handleScroll, 50);

        return () => {
            resizeObserver.disconnect();
            themeObserver.disconnect();
            window.removeEventListener("scroll", handleScroll);
            document.removeEventListener("astro:after-swap", handleScroll);
            document.removeEventListener("locale-change", handleLocaleChange);
            document.removeEventListener("locale-transition-settle", handleLocaleSettle);
            if (state.scrollRaf) cancelAnimationFrame(state.scrollRaf);
            if (state.animRaf) cancelAnimationFrame(state.animRaf);
        };
    }, []);

    if (dims.w === 0 || dims.w < 768) return null;

    return (
        <canvas
            ref={canvasRef}
            width={Math.round(dims.w * dims.dpr)}
            height={Math.round(dims.h * dims.dpr)}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: dims.w,
                height: dims.h,
                zIndex: 9999,
                pointerEvents: "none",
            }}
        />
    );
}
