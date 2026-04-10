import React, { useEffect, useRef, useState } from "react";

export default function ProgressBar() {
    const rectRef = useRef(null);
    const [dims, setDims] = useState({ w: 0, h: 0 });
    const [isReady, setIsReady] = useState(false);

    // Wait for intro to finish before showing
    useEffect(() => {
        if (!document.body.classList.contains('is-loading')) {
            setIsReady(true);
            return;
        }
        const handleReady = () => {
            // Delay to let layout fully stabilize after intro
            setTimeout(() => setIsReady(true), 500);
        };
        document.addEventListener('stagger-complete', handleReady);
        return () => document.removeEventListener('stagger-complete', handleReady);
    }, []);

    useEffect(() => {
        if (!isReady) return;
        const updateDims = () => setDims({ w: document.documentElement.clientWidth, h: window.innerHeight });
        window.addEventListener("resize", updateDims);
        updateDims();
        return () => window.removeEventListener("resize", updateDims);
    }, [isReady]);

    useEffect(() => {
        let requestDisplay;

        const handleScroll = () => {
            if (!rectRef.current || dims.w === 0) return;

            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;

            if (docHeight <= 0) return;

            const head = Math.min(Math.max(scrollTop / docHeight, 0), 1);

            const visibleThickness = 3;

            const strokeWidth = 3;
            const perimeter = 2 * ((dims.w - strokeWidth) + (dims.h - strokeWidth));
            const snakeLengthPx = 500; // Fixed size in pixels

            if (requestDisplay) cancelAnimationFrame(requestDisplay);

            requestDisplay = requestAnimationFrame(() => {
                const dashLength = snakeLengthPx;
                const gapLength = perimeter; // Gap large enough so it doesn't wrap

                if (rectRef.current) {
                    rectRef.current.style.strokeDasharray = `${dashLength} ${gapLength}`;
                    const shift = head * perimeter - dashLength;
                    rectRef.current.style.strokeDashoffset = -shift;
                }
            });
        };

        const resizeObserver = new ResizeObserver(() => {
            handleScroll();
        });
        resizeObserver.observe(document.body);

        window.addEventListener("scroll", handleScroll, { passive: true });

        const handlePageSwap = () => {
            if (rectRef.current) {
                rectRef.current.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.22, 1, 0.36, 1)';
                // We use 1300ms to give it a generous padding to finish before removing smooth scrolling
                setTimeout(() => {
                    if (rectRef.current) rectRef.current.style.transition = 'none';
                }, 1300);
            }
            // Trigger an immediate recalculation when swap happens to start the animation
            handleScroll();
        };
        document.addEventListener('astro:after-swap', handlePageSwap);

        // Initial setup on mount
        const initialTimeout = setTimeout(handleScroll, 50);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("scroll", handleScroll);
            document.removeEventListener('astro:after-swap', handlePageSwap);
            clearTimeout(initialTimeout);
            if (requestDisplay) cancelAnimationFrame(requestDisplay);
        };
    }, [dims]);

    if (!isReady || dims.w === 0) return null;

    const strokeWidth = 3; // Set back to 3px
    const inset = strokeWidth / 2;
    const rectWidth = dims.w - strokeWidth;
    const color = "#ec4899"; // pink-400

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: dims.w,
                height: dims.h,
                zIndex: 9999,
                pointerEvents: "none",
                overflow: "hidden" 
            }}
        >
            <svg
                width={dims.w}
                height={dims.h}
                style={{ overflow: "visible" }}
            >
                <rect
                    ref={rectRef}
                    x={inset}
                    y={inset}
                    width={rectWidth}
                    height={dims.h - strokeWidth}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="square" // Fills the tiny 1.5px gap perfectly to the edge
                    style={{
                        strokeDasharray: "0 99999",
                        filter: "drop-shadow(0 0 8px rgba(236,72,153,0.8))",
                    }}
                />
            </svg>
        </div>
    );
}
