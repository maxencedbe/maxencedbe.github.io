import { useEffect } from "react";

export default function ScrollObserver() {
    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: "0px 0px -150px 0px",
            threshold: 0.1,
        };

        const setupObserver = () => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            const animatedElements = document.querySelectorAll("[class*='animate-']");
            animatedElements.forEach((el) => {
                el.classList.remove("is-visible");
                observer.observe(el);
            });

            return () => {
                animatedElements.forEach((el) => observer.unobserve(el));
                observer.disconnect();
            }
        };

        let cleanup = setupObserver();

        const handlePageLoad = () => {
            if (cleanup) cleanup();
            cleanup = setupObserver();
        };

        document.addEventListener('astro:page-load', handlePageLoad);

        return () => {
            if (cleanup) cleanup();
            document.removeEventListener('astro:page-load', handlePageLoad);
        };
    }, []);

    return null;
}
