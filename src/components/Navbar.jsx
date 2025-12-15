import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const links = [
  { name: "Home", href: "/" },
  { name: "About me", href: "/about" },
  { name: "Projects", href: "/projects" },
];

const linksFr = [
  { name: "Accueil", href: "/" },
  { name: "À propos", href: "/about" },
  { name: "Projets", href: "/projects" },
];

const languages = [
  { code: "en", label: "ANG" },
  { code: "fr", label: "FRA" },
];

function normalize(p) {
  if (!p) return "/";
  if (p.length > 1 && p.endsWith("/")) return p.slice(0, -1);
  return p;
}

const resolveHref = (href) => {
  if (typeof window === "undefined") return normalize(href);
  try {
    return normalize(new URL(href, window.location.origin).pathname);
  } catch {
    return normalize(href);
  }
};

const findIndexFromPath = (path, locale) => {
  const n = normalize(path);
  const currentLinks = locale === "fr" ? linksFr : links;

  // Remove /fr prefix for matching if in French
  let pathToCheck = n;
  if (locale === "fr" && pathToCheck.startsWith("/fr")) {
    pathToCheck = pathToCheck.replace("/fr", "") || "/";
  }

  let idx = currentLinks.findIndex((l) => resolveHref(l.href) === pathToCheck);
  if (idx !== -1) return idx;

  idx = currentLinks.findIndex((l) => l.href !== "/" && pathToCheck.startsWith(resolveHref(l.href)));
  return idx !== -1 ? idx : 0;
};

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

export default function Navbar({ currentPath, currentLocale = "en" }) {
  const [activeIndex, setActiveIndex] = useState(() => findIndexFromPath(currentPath || "/", currentLocale));
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0 });
  const [isOpen, setIsOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const linkRefs = useRef([]);
  const navRef = useRef(null);
  const ulRef = useRef(null);
  const langMenuRef = useRef(null); // Deprecated, keeping for safety during transition
  const mobileLangMenuRef = useRef(null);
  const desktopLangMenuRef = useRef(null);

  const navLinks = currentLocale === "fr" ? linksFr : links;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    }
  }, []);

  // Scroll logic for smart navbar
  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== "undefined") {
        const currentScrollY = window.scrollY;

        if (currentScrollY > lastScrollY && currentScrollY > 50) {
          // Scrolling down & past threshold -> Hide
          setIsVisible(false);
        } else {
          // Scrolling up -> Show
          setIsVisible(true);
        }

        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener("scroll", controlNavbar);
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [lastScrollY]);

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (!mobileLangMenuRef.current || !mobileLangMenuRef.current.contains(event.target)) &&
        (!desktopLangMenuRef.current || !desktopLangMenuRef.current.contains(event.target))
      ) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  const changeLanguage = (newLocale) => {
    if (newLocale === currentLocale) {
      setIsLangMenuOpen(false);
      return;
    }

    let newPath = currentPath;

    if (newLocale === "fr") {
      if (!newPath.startsWith("/fr")) {
        newPath = "/fr" + (newPath === "/" ? "" : newPath);
      }
    } else {
      if (newPath.startsWith("/fr")) {
        newPath = newPath.replace("/fr", "") || "/";
      }
    }
    window.location.href = newPath;
  };

  const updateSlider = (index) => {
    if (window.innerWidth < 768) return;
    requestAnimationFrame(() => {
      const activeLink = linkRefs.current[index];
      const ul = ulRef.current;
      if (!activeLink || !ul) return;

      const linkRect = activeLink.getBoundingClientRect();
      const ulRect = ul.getBoundingClientRect();

      setSliderStyle({
        left: linkRect.left - ulRect.left,
        width: linkRect.width,
      });
    });
  };

  useEffect(() => {
    const handleNavigation = () => {
      const idx = findIndexFromPath(window.location.pathname, currentLocale);
      setActiveIndex(idx);
      updateSlider(idx);
    };
    const handleResize = () => updateSlider(activeIndex);

    handleNavigation();
    window.addEventListener("astro:after-swap", handleNavigation);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("astro:after-swap", handleNavigation);
      window.removeEventListener("resize", handleResize);
    };
  }, [activeIndex, currentLocale]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [isOpen]);

  // ✅ Fix iOS/Safari viewport height
  useEffect(() => {
    const setVh = () => {
      document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
    };
    setVh();
    window.addEventListener("resize", setVh);
    return () => window.removeEventListener("resize", setVh);
  }, []);

  const handleClick = (i) => {
    setActiveIndex(i);
    updateSlider(i);
    setIsOpen(false);

    document.body.classList.add("no-transition");
    setTimeout(() => {
      document.body.classList.remove("no-transition");
    }, 300);
  };

  const getLinkHref = (href) => {
    if (currentLocale === "fr") {
      return "/fr" + (href === "/" ? "" : href);
    }
    return href;
  };

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 w-full px-6 py-4 z-50 flex justify-between md:block transition-transform duration-300 bg-white/5 dark:bg-black/5 backdrop-blur-sm border-b-[0.5px] border-black/10 dark:border-white/10 ${isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
    >
      {/* Bouton hamburger mobile */}
      <button
        className="md:hidden flex flex-col gap-1 p-2 z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span
          className={`block w-6 h-0.5 transition-transform duration-300 ${theme === 'dark' ? 'bg-white' : 'bg-black'}`}
          style={{ transform: isOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }}
        />
        <span
          className={`block w-6 h-0.5 transition-opacity duration-300 ${theme === 'dark' ? 'bg-white' : 'bg-black'}`}
          style={{ opacity: isOpen ? 0 : 1 }}
        />
        <span
          className={`block w-6 h-0.5 transition-transform duration-300 ${theme === 'dark' ? 'bg-white' : 'bg-black'}`}
          style={{ transform: isOpen ? "rotate(-45deg) translate(5px, -5px)" : "none" }}
        />
      </button>

      {/* Theme & Language Toggle Mobile (Right side) */}
      <div className="md:hidden flex gap-2 items-center z-50">
        <div className="relative" ref={mobileLangMenuRef}>
          {/* Bouton visible quand le menu est fermé */}
          <button
            onClick={() => setIsLangMenuOpen(true)}
            className={`text-black dark:text-white cursor-pointer font-semibold text-xs transition-opacity duration-200 flex items-center justify-center gap-1 p-2 min-w-[60px] ${isLangMenuOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}
            aria-label="Open language menu"
          >
            {currentLocale === "en" ? "ANG" : "FRA"}
            <div className={`transition-transform duration-200 ${isLangMenuOpen ? "rotate-180" : "rotate-0"}`}>
              <ChevronDownIcon />
            </div>
          </button>

          {/* Menu unifié type "pillule" qui overlay le bouton */}
          <div
            className={`absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 transition-all duration-200 ease-in-out bg-white/50 dark:bg-black/90 backdrop-blur-sm border border-black/10 dark:border-white/10 rounded-xl p-2 min-w-[60px] z-[60] ${isLangMenuOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
              }`}
          >
            {/* Header du menu: Langue actuelle (agit comme bouton de fermeture) */}
            <button
              onClick={() => setIsLangMenuOpen(false)}
              className="font-semibold text-xs text-black dark:text-white flex items-center gap-1 justify-center w-full cursor-pointer transition-colors"
              aria-label="Close language menu"
            >
              {currentLocale === "en" ? "ANG" : "FRA"}
              <div className={`transition-transform duration-200 ${isLangMenuOpen ? "rotate-180" : "rotate-0"}`}>
                <ChevronDownIcon />
              </div>
            </button>

            {/* Options de langue */}
            {languages
              .filter((lang) => lang.code !== currentLocale)
              .map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className="font-medium text-xs text-black/50 dark:text-white/50 hover:text-pink-400 active:text-pink-400 transition-colors cursor-pointer w-full text-center"
                >
                  {lang.label}
                </button>
              ))}
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-full text-black dark:text-white cursor-pointer"
          aria-label="Toggle theme"
        >
          <span className="hidden dark:block"><SunIcon /></span>
          <span className="block dark:hidden"><MoonIcon /></span>
        </button>
      </div>

      {typeof document !== 'undefined' && createPortal(
        <>
          {/* Bouton fermeture menu mobile (dans le portal) */}
          <button
            className={`fixed top-4 left-6 md:hidden flex flex-col gap-1 p-2 z-[1000] transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
            onClick={() => setIsOpen(false)}
          >
            <span
              className={`block w-6 h-0.5 transition-transform duration-300 ${theme === 'dark' ? 'bg-white' : 'bg-black'}`}
              style={{ transform: "rotate(45deg) translate(5px, 5px)" }}
            />
            <span
              className={`block w-6 h-0.5 transition-opacity duration-300 ${theme === 'dark' ? 'bg-white' : 'bg-black'}`}
              style={{ opacity: 0 }}
            />
            <span
              className={`block w-6 h-0.5 transition-transform duration-300 ${theme === 'dark' ? 'bg-white' : 'bg-black'}`}
              style={{ transform: "rotate(-45deg) translate(5px, -5px)" }}
            />
          </button>
          {/* Overlay mobile animé */}
          <div
            className={`fixed inset-0 bg-transparent bg-opacity-30 backdrop-blur-sm md:hidden z-[998] transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
            onClick={() => setIsOpen(false)}
          />

          {/* Menu mobile slide-in/out */}
          <ul
            className={`fixed top-0 left-0 w-full h-[100dvh] md:h-screen bg-white/70 dark:bg-black/70 backdrop-blur-sm z-[999] flex flex-col justify-center items-center gap-8 p-8 transform transition-transform duration-300 md:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            style={{ height: "calc(var(--vh, 1vh) * 100)", backdropFilter: "blur(6px) saturate(150%)", WebkitBackdropFilter: "blur(6px) saturate(150%)" }}
          >
            {navLinks.map((link, i) => (
              <li key={link.href} className="w-full flex justify-center">
                <a
                  href={getLinkHref(link.href)}
                  ref={(el) => (linkRefs.current[i] = el)}
                  className={`font-sans text-lg tracking-wide transition-colors duration-300 ease-in-out text-center ${activeIndex === i
                    ? "text-pink-400 font-semibold underline underline-offset-4 decoration-pink-400 transition-none"
                    : "text-black dark:text-white hover:text-pink-400"
                    }`}
                  onClick={() => handleClick(i)}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </>,
        document.body
      )}

      {/* Menu desktop */}
      <div className="hidden md:flex md:flex-row md:items-center md:justify-between">
        <ul ref={ulRef} className="flex flex-row gap-x-8 relative">
          {navLinks.map((link, i) => (
            <li key={link.href} className="relative flex flex-col items-center md:items-start">
              <a
                href={getLinkHref(link.href)}
                ref={(el) => (linkRefs.current[i] = el)}
                className={`font-sans font-normal pb-0.5 transition-colors duration-400 ease-in-out ${activeIndex === i
                  ? "text-pink-400 transition-none"
                  : "text-black dark:text-white hover:text-pink-400"
                  }`}
                onClick={() => handleClick(i)}
              >
                {link.name}
              </a>
            </li>
          ))}
          {/* Slider desktop */}
          <span
            className="absolute bottom-0 h-[1px] bg-pink-400 rounded transition-all duration-200 hidden md:block"
            style={{
              left: sliderStyle.left,
              width: sliderStyle.width,
            }}
          />
        </ul>

        {/* Theme & Language Toggle Desktop */}
        <div className="flex gap-4 items-center">
          <div className="relative" ref={desktopLangMenuRef}>
            {/* Bouton visible quand le menu est fermé */}
            <button
              onClick={() => setIsLangMenuOpen(true)}
              className={`text-black dark:text-white cursor-pointer font-medium transition-opacity duration-200 flex items-center justify-center gap-1 min-w-[60px] ${isLangMenuOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}
              aria-label="Open language menu"
            >
              {currentLocale === "en" ? "ANG" : "FRA"}
              <div className={`transition-transform duration-200 ${isLangMenuOpen ? "rotate-180" : "rotate-0"}`}>
                <ChevronDownIcon />
              </div>
            </button>

            {/* Menu unifié type "pillule" qui overlay le bouton */}
            <div
              className={`absolute -top-[9px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 transition-all duration-200 ease-in-out bg-white/50 dark:bg-black/90 backdrop-blur-sm border border-black/10 dark:border-white/10 rounded-xl p-2 min-w-[60px] z-50 ${isLangMenuOpen
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
                }`}
            >
              {/* Header du menu: Langue actuelle (agit comme bouton de fermeture) */}
              <button
                onClick={() => setIsLangMenuOpen(false)}
                className="font-medium text-black dark:text-white flex items-center gap-1 justify-center w-full cursor-pointer transition-colors"
                aria-label="Close language menu"
              >
                {currentLocale === "en" ? "ANG" : "FRA"}
                <div className={`transition-transform duration-200 ${isLangMenuOpen ? "rotate-180" : "rotate-0"}`}>
                  <ChevronDownIcon />
                </div>
              </button>

              {/* Options de langue */}
              {languages
                .filter((lang) => lang.code !== currentLocale)
                .map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className="font-medium text-black/50 dark:text-white/50 hover:text-pink-400 active:text-pink-400 transition-colors cursor-pointer w-full text-center"
                  >
                    {lang.label}
                  </button>
                ))}
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-black dark:text-white cursor-pointer"
            aria-label="Toggle theme"
          >
            <span className="hidden dark:block"><SunIcon /></span>
            <span className="block dark:hidden"><MoonIcon /></span>
          </button>
        </div>
      </div>
    </nav >
  );
}