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
const RING_R = 12;
const OFFSETS = [[0, 0], [DOT_R, 0], [-DOT_R, 0], [0, DOT_R], [0, -DOT_R], [RING_R, 0], [-RING_R, 0], [0, RING_R], [0, -RING_R]];

export default function CustomCursor() {
    const cursorRef = useRef(null);
    const followerRef = useRef(null);

    useEffect(() => {
        if (window.matchMedia('(hover: none)').matches) return;

        const cursor = cursorRef.current;
        const follower = followerRef.current;

        const isDarkRef = { current: document.documentElement.classList.contains("dark") };
        const obs = new MutationObserver(() => {
            isDarkRef.current = document.documentElement.classList.contains("dark");
        });
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

        gsap.set(cursor, { xPercent: -50, yPercent: -50, opacity: 0 });
        gsap.set(follower, { xPercent: -50, yPercent: -50, opacity: 0, width: 24, height: 24 });
        gsap.set([cursor, follower], { mixBlendMode: "difference" });
        gsap.set(cursor, { backgroundColor: "#ffffff" });
        gsap.set(follower, { borderColor: "#ffffff" });

        let mouseX = 0, mouseY = 0, posX = 0, posY = 0;
        let currentState = "default";
        let exitPinkTimer = null;

        const setCursorState = (next) => {
            if (next === currentState) return;
            currentState = next;
            const color = isDarkRef.current ? "#ffffff" : "#000000";
            const isHover = next === "hover" || next === "hover-pink";
            const isNormal = next === "default-pink" || next === "hover-pink";

            gsap.to(follower, { width: isHover ? 40 : 24, height: isHover ? 40 : 24, duration: 0.3, ease: "power2.out" });
            gsap.set([cursor, follower], { mixBlendMode: isNormal ? "normal" : "difference" });
            gsap.set(cursor, { backgroundColor: isNormal ? color : "#ffffff" });
            gsap.set(follower, { borderColor: isNormal ? color : "#ffffff" });
        };

        const onMouseMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            gsap.to(cursor, { x: mouseX, y: mouseY, duration: 0.1, ease: "power2.out" });

            const centerEl = document.elementFromPoint(mouseX, mouseY);
            if (!centerEl || centerEl === cursor || centerEl === follower) return;

            const isClickable =
                centerEl.tagName === "A" || centerEl.tagName === "BUTTON" ||
                centerEl.closest?.("a") || centerEl.closest?.("button") ||
                centerEl.classList?.contains("cursor-pointer") || centerEl.closest?.(".cursor-pointer");
            const isNoHighlight =
                centerEl.classList?.contains("no-cursor-highlight") || centerEl.closest?.(".no-cursor-highlight");
            const clickable = isClickable && !isNoHighlight;

            // Check all 5 points (center + 4 ring-edge) for pink
            let pink = false;
            for (const [dx, dy] of OFFSETS) {
                const el = dx === 0 && dy === 0 ? centerEl : document.elementFromPoint(mouseX + dx, mouseY + dy);
                if (el && el !== cursor && el !== follower && isPinkElement(el)) { pink = true; break; }
            }

            const next = pink && clickable ? "hover-pink"
                : pink ? "default-pink"
                : clickable ? "hover"
                : "default";

            if (next.includes("pink")) {
                if (exitPinkTimer) { clearTimeout(exitPinkTimer); exitPinkTimer = null; }
                setCursorState(next);
            } else if (currentState.includes("pink")) {
                if (!exitPinkTimer) {
                    const target = next;
                    exitPinkTimer = setTimeout(() => {
                        exitPinkTimer = null;
                        setCursorState(target);
                    }, 30);
                }
            } else {
                setCursorState(next);
            }
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
                ref={cursorRef}
                className="fixed top-0 left-0 w-[3px] h-[3px] bg-white rounded-full pointer-events-none z-[9999] hidden md:block"
            />
            <div
                ref={followerRef}
                className="fixed top-0 left-0 border border-white rounded-full pointer-events-none z-[9998] hidden md:block box-border"
            />
        </>
    );
}
