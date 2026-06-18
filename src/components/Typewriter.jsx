import React, { useState, useEffect } from "react";
import { useLocale } from "./useLocale.js";

export default function Typewriter({ wordsEn, wordsFr, words, typeSpeed = 100, deleteSpeed = 50, delay = 1500 }) {
    const locale = useLocale();
    const activeWords = wordsEn && wordsFr ? (locale === 'fr' ? wordsFr : wordsEn) : (words || ['']);

    const [index, setIndex] = useState(0);
    const [subIndex, setSubIndex] = useState(0);
    const [reverse, setReverse] = useState(false);
    const [blink, setBlink] = useState(true);
    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        const newWord = activeWords[index] || '';
        setSubIndex(prev => Math.min(prev, newWord.length + 1));
    }, [locale]);

    useEffect(() => {
        if (!document.body.classList.contains('is-loading')) {
            setHasStarted(true);
            return;
        }
        const handler = () => {
            setIndex(0);
            setSubIndex(0);
            setReverse(false);
            setTimeout(() => setHasStarted(true), 300);
        };
        document.addEventListener('constellation-ready', handler);
        return () => document.removeEventListener('constellation-ready', handler);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => setBlink((prev) => !prev), 500);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!hasStarted) return;
        if (index >= activeWords.length) { setIndex(0); return; }
        const currentWord = activeWords[index];
        if (subIndex === currentWord.length + 1 && !reverse) {
            const t = setTimeout(() => setReverse(true), delay);
            return () => clearTimeout(t);
        }
        if (subIndex === 0 && reverse) {
            setReverse(false);
            setIndex((prev) => (prev + 1) % activeWords.length);
            return;
        }
        const t = setTimeout(() => setSubIndex((prev) => prev + (reverse ? -1 : 1)), reverse ? deleteSpeed : typeSpeed);
        return () => clearTimeout(t);
    }, [subIndex, index, reverse, activeWords, typeSpeed, deleteSpeed, delay, hasStarted]);

    return (
        <span className="inline-block relative">
            {`${activeWords[index].substring(0, subIndex)}`}
            <span className={`absolute -right-1 top-0 bottom-0 w-[2px] bg-pink-400 dark:bg-pink-400 transition-opacity duration-100 ${blink ? "opacity-100" : "opacity-0"}`}>&nbsp;</span>
        </span>
    );
}
