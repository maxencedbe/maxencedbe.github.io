import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

export default function CustomCursor() {
    const cursorRef = useRef(null); // The small dot
    const followerRef = useRef(null); // The lagging ring
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const cursor = cursorRef.current;
        const follower = followerRef.current;
        let mouseX = 0;
        let mouseY = 0;
        let posX = 0;
        let posY = 0;

        // Initial position
        gsap.set(cursor, { xPercent: -50, yPercent: -50 });
        gsap.set(follower, { xPercent: -50, yPercent: -50 });

        const onMouseMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            // Move dot instantly
            gsap.to(cursor, {
                x: mouseX,
                y: mouseY,
                duration: 0.1,
                ease: "power2.out"
            });
        };

        // Animation loop for follower (smooth lag)
        const loop = () => {
            posX += (mouseX - posX) / 8;
            posY += (mouseY - posY) / 8;

            gsap.set(follower, {
                x: posX,
                y: posY
            });

            requestAnimationFrame(loop);
        };

        loop();

        window.addEventListener("mousemove", onMouseMove);

        // Hover detection
        const handleMouseOver = (e) => {
            if (
                e.target.tagName === "A" ||
                e.target.tagName === "BUTTON" ||
                e.target.closest("a") ||
                e.target.closest("button") ||
                e.target.classList.contains("cursor-pointer")
            ) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        document.addEventListener("mouseover", handleMouseOver);
        document.body.style.cursor = "none";

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseover", handleMouseOver);
            document.body.style.cursor = "auto";
        };
    }, []);

    useEffect(() => {
        const follower = followerRef.current;
        if (isHovering) {
            gsap.to(follower, {
                scale: 1.5,
                borderColor: "#F472B6", // Tailwind pink-400
                backgroundColor: "rgba(244, 114, 182, 0.1)",
                duration: 0.3,
                ease: "power2.out"
            });
        } else {
            gsap.to(follower, {
                scale: 1,
                borderColor: "currentColor", // Resets to inherited color (text-black/white)
                backgroundColor: "transparent",
                duration: 0.3,
                ease: "power2.out"
            });
        }
    }, [isHovering]);

    return (
        <>
            {/* Small Dot */}
            <div
                ref={cursorRef}
                className="fixed top-0 left-0 w-2 h-2 bg-black dark:bg-white rounded-full pointer-events-none z-[9999] hidden md:block"
            />
            {/* Lagging Ring */}
            <div
                ref={followerRef}
                className="fixed top-0 left-0 w-10 h-10 border border-black/30 dark:border-white/30 rounded-full pointer-events-none z-[9998] hidden md:block transition-colors duration-300 box-border"
            />
        </>
    );
}
