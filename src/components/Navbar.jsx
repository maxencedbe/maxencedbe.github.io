import { useEffect, useRef, useState } from "react";
import { navigate } from "astro:transitions/client";

const languages = [
  { code: "en", label: "ANG" },
  { code: "fr", label: "FRA" },
];

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

export default function Navbar({ currentPath, currentLocale = "en" }) {
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [time, setTime] = useState("");

  const langMenuRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        new Intl.DateTimeFormat("en-US", {
          timeZone: "Europe/Paris",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(now)
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", newTheme);
  };

  const getLabel = (locale) => {
    const found = languages.find(l => l.code === locale);
    return found ? found.label : "ANG";
  };

  const handleLanguageSwitch = (e, newLocale) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      sessionStorage.setItem('langScroll', window.scrollY);
    }
    navigate(newLocale === "fr" ? "/fr" : "/");
  };

  const resumeUrl = currentLocale === 'fr' ? '/Maxence_Debes_Resume_Fra.pdf' : '/Maxence_Debes_Resume_Ang.pdf';

  return (
    <nav className="fixed top-0 left-0 w-full px-6 py-4 z-[90] flex items-center justify-between">
      {/* Dynamic Glass Background */}
      <div
        className="absolute inset-0 -z-10 bg-white/5 dark:bg-black/5 backdrop-blur-sm border-b-[0.5px] border-black/10 dark:border-white/10"
        style={{
          WebkitBackdropFilter: "blur(8px)",
          backdropFilter: "blur(8px)",
        }}
      />

      {/* LEFT SIDE: Branding & Widgets */}
      <div className="flex items-center gap-6">
        {/* 1. Branding */}
        <div className="text-black dark:text-white font-bold text-lg md:text-xl tracking-tight">
          Maxence Debes
        </div>

        {/* 2. Desktop Only Widgets */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-medium text-black/60 dark:text-white/60">

          <div className="w-[1px] h-4 bg-black/10 dark:bg-white/10"></div>

          {/* Timezone */}
          <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 text-black dark:text-white px-3 py-1.5 rounded-full border border-black/5 dark:border-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <span>Paris, FR — {time}</span>
          </div>

          <div className="w-[1px] h-4 bg-black/10 dark:bg-white/10"></div>

          {/* Resume Buttons */}
          <div className="flex items-center gap-2">
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-1.5 bg-black/5 dark:bg-white/5 text-black dark:text-white px-3 py-1.5 rounded-full border border-black/5 dark:border-white/5 transition-all duration-300 hover:bg-pink-400 hover:text-white hover:border-pink-400 dark:hover:bg-pink-400/80 dark:hover:text-black dark:hover:border-pink-400/80 hover:scale-105 active:scale-95 hover:shadow-pink-400/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-colors duration-300">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <span>View resume</span>
            </a>

            <a
              href={resumeUrl}
              download
              className="group flex items-center gap-1.5 bg-black/5 dark:bg-white/5 text-black dark:text-white px-3 py-1.5 rounded-full border border-black/5 dark:border-white/5 transition-all duration-300 hover:bg-pink-400 hover:text-white hover:border-pink-400 dark:hover:bg-pink-400/80 dark:hover:text-black dark:hover:border-pink-400/80 hover:scale-105 active:scale-95 hover:shadow-pink-400/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-colors duration-300">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Download resume</span>
            </a>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Lang & Theme */}
      <div className="flex gap-2 md:gap-4 items-center">
        <div className="relative" ref={langMenuRef}>
          <button
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className={`text-black dark:text-white cursor-pointer font-medium text-sm transition-opacity duration-200 flex items-center justify-center gap-1 min-w-[60px] ${isLangMenuOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}
            aria-label="Open language menu"
          >
            {getLabel(currentLocale)}
            <div className={`transition-transform duration-200 ${isLangMenuOpen ? "rotate-180" : "rotate-0"}`}>
              <ChevronDownIcon />
            </div>
          </button>

          <div
            className={`absolute -top-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 transition-all duration-200 ease-in-out bg-white/70 dark:bg-black/75 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-xl p-2 min-w-[60px] z-50 ${isLangMenuOpen
              ? "opacity-100 pointer-events-auto shadow-lg"
              : "opacity-0 pointer-events-none"
              }`}
          >
            <button
              onClick={() => setIsLangMenuOpen(false)}
              className="font-medium text-sm text-black dark:text-white flex items-center gap-1 justify-center w-full cursor-pointer transition-colors"
              aria-label="Close language menu"
            >
              {getLabel(currentLocale)}
              <div className={`transition-transform duration-200 ${isLangMenuOpen ? "rotate-180" : "rotate-0"}`}>
                <ChevronDownIcon />
              </div>
            </button>

            {languages
              .filter((lang) => lang.code !== currentLocale)
              .map((lang) => {
                return (
                  <a
                    key={lang.code}
                    href={lang.code === "fr" ? "/fr" : "/"}
                    onClick={(e) => handleLanguageSwitch(e, lang.code)}
                    className="font-medium text-sm text-black/50 dark:text-white/50 hover:text-pink-400 active:text-pink-400 transition-colors cursor-pointer w-full text-center block pt-1"
                  >
                    {lang.label}
                  </a>
                );
              })}
          </div>
        </div>

        {/* iPhone Style Theme Slider - Refined Glassmorphism Version */}
        <div 
          onClick={toggleTheme}
          className="relative w-[72px] h-9 rounded-full bg-black/[0.05] dark:bg-white/[0.08] border border-black/10 dark:border-white/10 cursor-pointer transition-all duration-300 flex items-center"
          role="button"
          aria-label="Toggle theme"
        >
          {/* Background Icons - Balanced spacing */}
          <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none opacity-30">
            <div className="scale-[0.8] text-black dark:text-white"><SunIcon /></div>
            <div className="scale-[0.8] text-black dark:text-white"><MoonIcon /></div>
          </div>

          {/* Sliding Thumb - Glassmorphism Effect */}
          <div 
            className={`absolute left-1 w-7 h-7 rounded-full bg-white/40 dark:bg-white/10 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-sm flex items-center justify-center cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${theme === 'dark' ? 'translate-x-[36px]' : 'translate-x-0'}`}
            style={{ 
              WebkitBackdropFilter: "blur(12px)",
              backdropFilter: "blur(12px)"
            }}
          >
            <div className="text-black dark:text-white scale-[0.7] drop-shadow-sm">
              {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}