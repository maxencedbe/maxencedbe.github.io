import React, { useEffect, useRef, useState } from "react";

export default function ProgressBar() {
    const rectRef = useRef(null);
    const [dims, setDims] = useState({ w: 0, h: 0 });

    useEffect(() => {
        const updateDims = () => setDims({ w: document.documentElement.clientWidth, h: window.innerHeight });
        window.addEventListener("resize", updateDims);
        updateDims();
        return () => window.removeEventListener("resize", updateDims);
    }, []);

    useEffect(() => {
        let requestDisplay;

        const handleScroll = () => {
            if (!rectRef.current || dims.w === 0) return;

            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;

            if (docHeight <= 0) return;

            const head = Math.min(Math.max(scrollTop / docHeight, 0), 1);

            const visibleThickness = 3;

            const perimeter = 2 * (dims.w + dims.h);
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

        window.addEventListener("scroll", handleScroll, { passive: true });

        // Initial setup on mount
        const initialTimeout = setTimeout(handleScroll, 50);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            clearTimeout(initialTimeout);
            if (requestDisplay) cancelAnimationFrame(requestDisplay);
        };
    }, [dims]);

    if (dims.w === 0) return null;

    // To ensure 100% symmetry between the Top edge (whose shadow is naturally clipped
    // by the physical monitor) and the Right edge (whose shadow was bleeding into the WebKit scrollbar area),
    // we use a pure HTML <div> with 'overflow: hidden' mapped precisely to dims.w (clientWidth).
    // The SVG draws a 6px stroke centered on the 0/w/h boundary.
    // The HTML <div> acts as a mathematical guillotine, slicing exactly 3px and trimming 
    // all outward drop shadows perfectly on all 4 sides identically.
    const visibleThickness = 3.5;
    const strokeWidth = visibleThickness * 2; // 6px centered stroke
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
                overflow: "hidden" // The Guillotine
            }}
        >
            <svg
                width={dims.w}
                height={dims.h}
                style={{ overflow: "visible" }}
            >
                <rect
                    ref={rectRef}
                    x={0}
                    y={0}
                    width={dims.w}
                    height={dims.h}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    style={{
                        filter: "drop-shadow(0 0 6px rgba(236,72,153,0.8))",
                    }}
                />
            </svg>
        </div>
    );
}
