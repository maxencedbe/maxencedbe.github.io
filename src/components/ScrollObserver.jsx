import { useEffect } from "react";

export default function ScrollObserver() {
    useEffect(() => {
        let isPaused = false;

        // Reveal once and stay revealed. This used to also strip `is-visible`
        // whenever an element left the viewport, so the hero replayed its
        // entrance every time you scrolled back up to it — the animation is
        // meant to be an arrival flourish, not a permanent scroll effect. Each
        // element is unobserved as soon as it fires, which also means the
        // observers empty themselves out instead of running for the page's life.
        const revealOnce = (entries, observer) => {
            if (isPaused) return;
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        };

        const setupObserver = () => {
            const observerDefault = new IntersectionObserver(revealOnce,
                { root: null, rootMargin: "0px 0px -150px 0px", threshold: 0.1 });

            const observerEarly = new IntersectionObserver(revealOnce,
                { root: null, rootMargin: "0px 0px 0px 0px", threshold: 0.1 });

            const animatedElements = document.querySelectorAll("[class*='reveal-']");
            animatedElements.forEach((el) => {
                el.classList.remove("is-visible");
                if (el.classList.contains("reveal-early")) {
                    observerEarly.observe(el);
                } else {
                    observerDefault.observe(el);
                }
            });

            // Also observe section background reveals (trigger early)
            const sectionBgElements = document.querySelectorAll(".section-bg-reveal");
            sectionBgElements.forEach((el) => {
                el.classList.remove("is-visible");
                observerEarly.observe(el);
            });

            return () => {
                animatedElements.forEach((el) => {
                    observerDefault.unobserve(el);
                    observerEarly.unobserve(el);
                });
                observerDefault.disconnect();
                observerEarly.disconnect();
            }
        };

        // Check if constellation intro is active — if so, pause until stagger-complete
        if (document.body.classList.contains('is-loading')) {
            isPaused = true;
        }

        let cleanup = setupObserver();

        const handlePageLoad = () => {
            if (cleanup) cleanup();
            isPaused = false;
            cleanup = setupObserver();
        };

        // Resume observer after the stagger sequence is done
        const handleStaggerComplete = () => {
            isPaused = false;
        };

        document.addEventListener('astro:page-load', handlePageLoad);
        document.addEventListener('stagger-complete', handleStaggerComplete);

        return () => {
            if (cleanup) cleanup();
            document.removeEventListener('astro:page-load', handlePageLoad);
            document.removeEventListener('stagger-complete', handleStaggerComplete);
        };
    }, []);

    return null;
}
