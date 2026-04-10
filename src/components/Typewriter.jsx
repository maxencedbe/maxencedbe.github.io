import React, { useState, useEffect } from "react";

export default function Typewriter({ words, typeSpeed = 100, deleteSpeed = 50, delay = 1500 }) {
    const [index, setIndex] = useState(0);
    const [subIndex, setSubIndex] = useState(0);
    const [reverse, setReverse] = useState(false);
    const [blink, setBlink] = useState(true);
    const [hasStarted, setHasStarted] = useState(false);

    // Start typing when constellation intro is done
    useEffect(() => {
        // If intro already completed (e.g. language switch), start immediately
        if (!document.body.classList.contains('is-loading')) {
            setHasStarted(true);
            return;
        }

        // Otherwise wait for constellation intro to finish
        const handler = () => {
            setIndex(0);
            setSubIndex(0);
            setReverse(false);
            setTimeout(() => setHasStarted(true), 300);
        };

        document.addEventListener('constellation-ready', handler);
        return () => document.removeEventListener('constellation-ready', handler);
    }, []);

    // Blinking cursor effect
    useEffect(() => {
        const interval = setInterval(() => {
            setBlink((prev) => !prev);
        }, 500);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!hasStarted) return;

        if (index >= words.length) {
            setIndex(0);
            return;
        }

        const currentWord = words[index];

        if (subIndex === currentWord.length + 1 && !reverse) {
            const timeout = setTimeout(() => {
                setReverse(true);
            }, delay);
            return () => clearTimeout(timeout);
        }

        if (subIndex === 0 && reverse) {
            setReverse(false);
            setIndex((prev) => (prev + 1) % words.length);
            return;
        }

        const timeout = setTimeout(() => {
            setSubIndex((prev) => prev + (reverse ? -1 : 1));
        }, reverse ? deleteSpeed : typeSpeed);

        return () => clearTimeout(timeout);
    }, [subIndex, index, reverse, words, typeSpeed, deleteSpeed, delay, hasStarted]);

    return (
        <span className="inline-block relative">
            {`${words[index].substring(0, subIndex)}`}
            <span className={`absolute -right-1 top-0 bottom-0 w-[2px] bg-pink-400 dark:bg-pink-400 transition-opacity duration-100 ${blink ? "opacity-100" : "opacity-0"}`}>&nbsp;</span>
        </span>
    );
}
