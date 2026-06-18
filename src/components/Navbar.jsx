import { useEffect, useRef, useState } from "react";

const parisFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Europe/Paris",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const HamburgerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

export default function Navbar() {
  const initialLocale = typeof localStorage !== 'undefined' ? (localStorage.getItem('locale') || 'en') : 'en';
  const [activeLocale, setActiveLocale] = useState(initialLocale);
  const [bubbleLocale, setBubbleLocale] = useState(initialLocale);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light"
  );
  const [time, setTime] = useState("");

  const navRef = useRef(null);
  const menuContentRef = useRef(null);
  const menuPanelRef = useRef(null);
  const [menuHeight, setMenuHeight] = useState(0);

  useEffect(() => {
    if (menuContentRef.current) setMenuHeight(menuContentRef.current.scrollHeight);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      setActiveLocale(e.detail.locale);
      setBubbleLocale(e.detail.locale);
    };
    document.addEventListener('locale-change', handler);
    return () => document.removeEventListener('locale-change', handler);
  }, []);

  useEffect(() => {
    const close = () => {
      setIsMobileMenuOpen(false);
      if (menuPanelRef.current) {
        menuPanelRef.current.style.transition = 'none';
        menuPanelRef.current.style.height = '0';
      }
    };
    document.addEventListener('astro:before-swap', close);
    return () => document.removeEventListener('astro:before-swap', close);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) setIsMobileMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const updateTime = () => setTime(parisFormatter.format(new Date()));
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    const apply = () => {
      setTheme(newTheme);
      if (newTheme === "dark") document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", newTheme);
    };
    if (!document.startViewTransition) { apply(); return; }
    document.documentElement.dataset.themeTransition = "";
    const t = document.startViewTransition(apply);
    t.finished.finally(() => { delete document.documentElement.dataset.themeTransition; });
  };

  const handleLanguageSwitch = () => {
    const newLocale = bubbleLocale === 'en' ? 'fr' : 'en';
    setBubbleLocale(newLocale);
    if (menuPanelRef.current) {
      menuPanelRef.current.style.transition = 'none';
      menuPanelRef.current.style.height = '0';
    }
    setIsMobileMenuOpen(false);
    if (typeof window !== 'undefined' && typeof window.switchLocale === 'function') {
      window.switchLocale(newLocale);
    }
  };

  const resumeUrl = activeLocale === 'fr' ? '/Maxence_Debes_Resume_Fra.pdf' : '/Maxence_Debes_Resume_Ang.pdf';
  const resumeViewLabel = activeLocale === 'fr' ? 'Voir le CV' : 'View resume';
  const resumeDownloadLabel = activeLocale === 'fr' ? 'Télécharger le CV' : 'Download resume';

  return (
    <nav ref={navRef} className="fixed top-0 left-0 w-full z-[90]">
      <div
        className="absolute inset-0 -z-10 bg-white/5 dark:bg-black/5 backdrop-blur-sm border-b-[0.5px] border-black/10 dark:border-white/10"
        style={{ WebkitBackdropFilter: "blur(8px)", backdropFilter: "blur(8px)" }}
      />

      <div className="flex items-center justify-between px-6 py-3">
        {/* LEFT */}
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden flex items-center justify-center text-black dark:text-white cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <HamburgerIcon />
          </button>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-black dark:text-white font-bold text-lg md:text-xl tracking-tight cursor-pointer transition-colors duration-300 hover:text-pink-400 whitespace-nowrap"
          >
            Maxence Debes
          </button>

          <div className="hidden lg:flex items-center gap-4">
            <div className="w-[1px] h-4 bg-black/30 dark:bg-white/30"></div>
            <span className="flex items-center gap-1.5 text-sm font-semibold tracking-wide text-black dark:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              Paris, FR — {time}
            </span>
            <div className="w-[1px] h-4 bg-black/30 dark:bg-white/30"></div>
            <a data-locale-fade href={resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm font-semibold tracking-wide text-black dark:text-white hover:text-pink-400 dark:hover:text-pink-400 transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              {resumeViewLabel}
            </a>
            <div data-locale-fade className="w-[1px] h-4 bg-black/30 dark:bg-white/30"></div>
            <a data-locale-fade href={resumeUrl} download className="flex items-center gap-1.5 text-sm font-semibold tracking-wide text-black dark:text-white hover:text-pink-400 dark:hover:text-pink-400 transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              {resumeDownloadLabel}
            </a>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3 md:gap-5 lg:gap-6">
          {/* Lang toggle */}
          <div
            onClick={handleLanguageSwitch}
            className="hidden lg:flex relative w-[72px] h-9 rounded-full bg-[rgba(255,255,255,0.9)] dark:bg-[rgba(10,10,10,0.88)] backdrop-blur-[20px] border border-black/10 dark:border-white/[0.15] cursor-pointer items-center"
            role="button"
            aria-label="Switch language"
          >
            <div className="absolute inset-0 pointer-events-none opacity-30 flex">
              <div className="w-1/2 h-full flex items-center justify-center">
                <span className="text-xs font-normal text-black dark:text-white">EN</span>
              </div>
              <div className="w-1/2 h-full flex items-center justify-center">
                <span className="text-xs font-normal text-black dark:text-white">FR</span>
              </div>
            </div>
            <div
              className={`absolute top-[3px] left-[3px] w-7 h-7 rounded-full bg-white/40 dark:bg-white/10 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-sm flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${bubbleLocale === 'fr' ? 'translate-x-[36px]' : 'translate-x-0'}`}
              style={{ WebkitBackdropFilter: "blur(12px)", backdropFilter: "blur(12px)" }}
            >
              <span className="text-xs font-normal text-black dark:text-white">
                {bubbleLocale === 'fr' ? 'FR' : 'EN'}
              </span>
            </div>
          </div>

          {/* Theme toggle */}
          <div
            onClick={toggleTheme}
            className="relative w-[72px] h-9 rounded-full bg-[rgba(255,255,255,0.9)] dark:bg-[rgba(10,10,10,0.88)] backdrop-blur-[20px] border border-black/10 dark:border-white/[0.15] shadow-none cursor-pointer transition-all duration-300 flex items-center"
            role="button"
            aria-label="Toggle theme"
          >
            <div className="absolute inset-0 pointer-events-none opacity-30">
              <div className="absolute top-[3px] left-[3px] w-7 h-7 flex items-center justify-center">
                <div className="scale-[0.7] text-black dark:text-white"><SunIcon /></div>
              </div>
              <div className="absolute top-[3px] left-[3px] w-7 h-7 translate-x-[36px] flex items-center justify-center">
                <div className="scale-[0.7] text-black dark:text-white"><MoonIcon /></div>
              </div>
            </div>
            <div
              className={`absolute top-[3px] left-[3px] w-7 h-7 rounded-full bg-white/40 dark:bg-white/10 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-sm flex items-center justify-center cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${theme === 'dark' ? 'translate-x-[36px]' : 'translate-x-0'}`}
              style={{ WebkitBackdropFilter: "blur(12px)", backdropFilter: "blur(12px)" }}
            >
              <div className="text-black dark:text-white scale-[0.7] drop-shadow-sm">
                {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <div
        ref={menuPanelRef}
        className="lg:hidden absolute left-0 right-0 top-full overflow-hidden bg-white/5 dark:bg-black/5 border-b-[0.5px] border-black/10 dark:border-white/10"
        style={{
          height: isMobileMenuOpen ? menuHeight : 0,
          transition: 'height 0.35s cubic-bezier(0.22,1,0.36,1)',
          WebkitBackdropFilter: 'blur(8px)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div ref={menuContentRef}>
          <div className="px-6 pt-3 pb-5 flex flex-col border-t border-black/8 dark:border-white/8">
            <a
              data-locale-fade
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 py-3 text-sm font-semibold text-black dark:text-white hover:text-pink-400 dark:hover:text-pink-400 transition-colors duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              {resumeViewLabel}
            </a>
            <a
              data-locale-fade
              href={resumeUrl}
              download
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 py-3 text-sm font-semibold text-black dark:text-white hover:text-pink-400 dark:hover:text-pink-400 transition-colors duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              {resumeDownloadLabel}
            </a>
            <div className="mt-2 pt-3 border-t border-black/8 dark:border-white/8 flex gap-2">
              {['en', 'fr'].map((code) => (
                <button
                  key={code}
                  onClick={bubbleLocale === code ? () => setIsMobileMenuOpen(false) : handleLanguageSwitch}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    bubbleLocale === code ? 'bg-pink-400 text-white' : 'text-black dark:text-white hover:text-pink-400 dark:hover:text-pink-400'
                  }`}
                >
                  {code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
