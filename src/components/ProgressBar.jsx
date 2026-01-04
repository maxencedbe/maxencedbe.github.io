import React, { useEffect, useRef } from "react";

export default function ProgressBar() {
    const progressRef = useRef(null);

    useEffect(() => {
        let requestDisplay;

        const handleScroll = () => {
            if (!progressRef.current) return;

            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;


            if (docHeight <= 0) return;

            const scrollPercent = scrollTop / docHeight;


            if (requestDisplay) cancelAnimationFrame(requestDisplay);

            requestDisplay = requestAnimationFrame(() => {
                if (progressRef.current) {
                    progressRef.current.style.transform = `scaleX(${scrollPercent})`;
                }
            });
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll);
            if (requestDisplay) cancelAnimationFrame(requestDisplay);
        };
    }, []);

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                height: "2.5px",
                width: "100%",
                backgroundColor: "transparent",
                zIndex: 9999,
                pointerEvents: "none",
            }}
        >
            <div
                ref={progressRef}
                className="bg-pink-400 opacity-100"
                style={{
                    height: "100%",
                    width: "100%",
                    transformOrigin: "0% 50%",
                }}
            />
        </div>
    );
}
