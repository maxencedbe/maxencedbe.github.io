import React, { useState, useEffect } from "react";

export default function Typewriter({ words, typeSpeed = 100, deleteSpeed = 50, delay = 1500 }) {
    const [index, setIndex] = useState(0);
    const [subIndex, setSubIndex] = useState(0);
    const [reverse, setReverse] = useState(false);
    const [blink, setBlink] = useState(true);

    // Blinking cursor effect
    useEffect(() => {
        const timeout2 = setInterval(() => {
            setBlink((prev) => !prev);
        }, 500);
        return () => clearInterval(timeout2);
    }, []);

    useEffect(() => {
        if (index >= words.length) {
            // Reset to beginning if we went past the last word (shouldn't happen with logic below, but safety)
            setIndex(0);
            return;
        }

        const currentWord = words[index];

        if (subIndex === currentWord.length + 1 && !reverse) {
            // Finished typing word, wait before deleting
            const timeout = setTimeout(() => {
                setReverse(true);
            }, delay);
            return () => clearTimeout(timeout);
        }

        if (subIndex === 0 && reverse) {
            // Finished deleting, move to next word
            setReverse(false);
            setIndex((prev) => (prev + 1) % words.length);
            return;
        }

        const timeout = setTimeout(() => {
            setSubIndex((prev) => prev + (reverse ? -1 : 1));
        }, reverse ? deleteSpeed : typeSpeed);

        return () => clearTimeout(timeout);
    }, [subIndex, index, reverse, words, typeSpeed, deleteSpeed, delay]);

    return (
        <span className="inline-block relative">
            {`${words[index].substring(0, subIndex)}`}
            <span className={`absolute -right-1 top-0 bottom-0 w-[2px] bg-pink-400 dark:bg-pink-400 transition-opacity duration-100 ${blink ? "opacity-100" : "opacity-0"}`}>&nbsp;</span>
        </span>
    );
}
