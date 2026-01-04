import { useEffect, useState } from "react";

const ArrowUpIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="m18 15-6-6-6 6" />
    </svg>
);

export default function BackToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <button
            onClick={scrollToTop}
            className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 p-2 md:p-3 rounded-full shadow-lg z-40 transition-all duration-300 ease-in-out ${isVisible
                ? "opacity-100 translate-y-0 cursor-pointer pointer-events-auto"
                : "opacity-0 translate-y-10 pointer-events-none"
                } bg-white/50 dark:bg-black/75 backdrop-blur-sm border border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black hover:scale-110`}
            aria-label="Back to top"
        >
            <ArrowUpIcon />
        </button>
    );
}
