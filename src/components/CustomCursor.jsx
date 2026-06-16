import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const isPinkElement = (el) => {
    let node = el;
    while (node && node !== document.body) {
        const classes = [...node.classList];
        if (classes.some(c =>
            c === "filter-btn" ||
            c.startsWith("bg-pink") ||
            c.startsWith("hover:bg-pink") ||
            c.startsWith("hover:text-pink")
        )) return true;
        // Catch elements already rendered with a pink background (e.g. active state via JS)
        const bg = window.getComputedStyle(node).backgroundColor;
        const m = bg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (m && +m[1] > 180 && +m[2] < 140 && +m[3] > 100 && +m[1] > +m[2] + 80) return true;
        node = node.parentElement;
    }
    return false;
};

export default function CustomCursor() {
    const cursorRef = useRef(null);
    const followerRef = useRef(null);
    const [state, setState] = useState("default"); // "default" | "hover" | "hover-pink"
    const [isDark, setIsDark] = useState(() =>
        typeof document !== "undefined" && document.documentElement.classList.contains("dark")
    );

    useEffect(() => {
        const obs = new MutationObserver(() => {
            setIsDark(document.documentElement.classList.contains("dark"));
        });
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        return () => obs.disconnect();
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const cursor = cursorRef.current;
        const follower = followerRef.current;
        let mouseX = 0, mouseY = 0, posX = 0, posY = 0;

        gsap.set(cursor, { xPercent: -50, yPercent: -50 });
        gsap.set(follower, { xPercent: -50, yPercent: -50 });

        const onMouseMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            gsap.to(cursor, { x: mouseX, y: mouseY, duration: 0.1, ease: "power2.out" });
        };

        const loop = () => {
            posX += (mouseX - posX) / 8;
            posY += (mouseY - posY) / 8;
            gsap.set(follower, { x: posX, y: posY });
            requestAnimationFrame(loop);
        };
        loop();

        window.addEventListener("mousemove", onMouseMove);

        const onMouseLeave = () => gsap.set([cursor, follower], { opacity: 0 });
        const onMouseEnter = () => gsap.set([cursor, follower], { opacity: 1 });
        document.addEventListener("mouseleave", onMouseLeave);
        document.addEventListener("mouseenter", onMouseEnter);

        const handleMouseOver = (e) => {
            const el = e.target;
            const isClickable =
                el.tagName === "A" || el.tagName === "BUTTON" ||
                el.closest("a") || el.closest("button") ||
                el.classList.contains("cursor-pointer") || el.closest(".cursor-pointer");

            const isNoHighlight =
                el.classList.contains("no-cursor-highlight") || el.closest(".no-cursor-highlight");

            if (!isClickable || isNoHighlight) {
                setState("default");
            } else if (isPinkElement(el)) {
                setState("hover-pink");
            } else {
                setState("hover");
            }
        };

        document.addEventListener("mouseover", handleMouseOver);

        const styleEl = document.createElement("style");
        styleEl.textContent = "* { cursor: none !important; }";
        document.head.appendChild(styleEl);

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseover", handleMouseOver);
            document.removeEventListener("mouseleave", onMouseLeave);
            document.removeEventListener("mouseenter", onMouseEnter);
            document.head.removeChild(styleEl);
        };
    }, []);

    useEffect(() => {
        const cursor = cursorRef.current;
        const follower = followerRef.current;
        const color = isDark ? "#ffffff" : "#000000";
        const isHover = state === "hover" || state === "hover-pink";

        gsap.to(follower, {
            width: isHover ? 40 : 24,
            height: isHover ? 40 : 24,
            duration: 0.3,
            ease: "power2.out",
        });

        if (state === "hover-pink") {
            gsap.to([cursor, follower], { mixBlendMode: "normal", duration: 0 });
            gsap.to(cursor, { backgroundColor: color, duration: 0.15 });
            gsap.to(follower, { borderColor: color, duration: 0.15 });
        } else {
            gsap.to([cursor, follower], { mixBlendMode: "difference", duration: 0 });
            gsap.to(cursor, { backgroundColor: "#ffffff", duration: 0.15 });
            gsap.to(follower, { borderColor: "#ffffff", duration: 0.15 });
        }
    }, [state, isDark]);

    return (
        <>
            <div
                ref={cursorRef}
                className="fixed top-0 left-0 w-[3px] h-[3px] bg-white rounded-full pointer-events-none z-[9999] hidden md:block mix-blend-difference"
            />
            <div
                ref={followerRef}
                className="fixed top-0 left-0 w-6 h-6 border border-white rounded-full pointer-events-none z-[9998] hidden md:block box-border mix-blend-difference"
            />
        </>
    );
}
