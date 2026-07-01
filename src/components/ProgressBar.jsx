import React, { useEffect, useRef, useState } from "react";

const STROKE = 3.5;
const SNAKE = 500;
const COLOR = "#f472b6";

function drawSnake(canvas, progress) {
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    const dpr = window.devicePixelRatio || 1;
    const t = Math.max(1, Math.round(STROKE * dpr));

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = COLOR;

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
    const stateRef = useRef({ current: 0, animRaf: null, scrollRaf: null, localeChanging: false });

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

    useEffect(() => {
        if (dims.w === 0) return;

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
            // Ignore scroll events fired by the locale switch scroll correction
            if (state.localeChanging) return;
            if (state.animRaf) { cancelAnimationFrame(state.animRaf); state.animRaf = null; }
            drawCurrent();
        };

        const handleLocaleChange = () => {
            state.localeChanging = true;
            // Wait for the scroll correction (2 rAFs ~33ms) + layout settle before animating
            setTimeout(() => {
                state.localeChanging = false;
                animateTo(getProgress());
            }, 100);
        };

        // Animated glide when page expands (show more — progress drops suddenly)
        const animateTo = (target) => {
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
        window.addEventListener("scroll", handleScroll, { passive: true });
        document.addEventListener("astro:after-swap", handleScroll);
        document.addEventListener("locale-change", handleLocaleChange);

        setTimeout(handleScroll, 50);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("scroll", handleScroll);
            document.removeEventListener("astro:after-swap", handleScroll);
            document.removeEventListener("locale-change", handleLocaleChange);
            if (state.scrollRaf) cancelAnimationFrame(state.scrollRaf);
            if (state.animRaf) cancelAnimationFrame(state.animRaf);
        };
    }, [dims]);

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
