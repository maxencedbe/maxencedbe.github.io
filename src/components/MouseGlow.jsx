import { useEffect, useRef } from "react";

export default function MouseGlow() {
    const glowRef = useRef(null);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (glowRef.current) {
                glowRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div
            ref={glowRef}
            className="pointer-events-none fixed top-0 left-0 w-[600px] h-[600px] -ml-[300px] -mt-[300px] rounded-full bg-black/5 dark:bg-white/5 blur-[80px] transition-colors duration-500 z-0"
            style={{ willChange: "transform" }}
        />
    );
}
