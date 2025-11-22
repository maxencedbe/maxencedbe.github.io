import { useEffect, useRef, useState } from "react";

const links = [
  { name: "Home", href: "/" },
  { name: "About me", href: "/about" },
  { name: "Projects", href: "/projects" },
];

function normalize(p) {
  if (!p) return "/";
  if (p.length > 1 && p.endsWith("/")) return p.slice(0, -1);
  return p;
}

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

export default function Navbar() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0 });
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState("dark");
  const linkRefs = useRef([]);
  const navRef = useRef(null);
  const ulRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    }
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

  const resolveHref = (href) => {
    try {
      return normalize(new URL(href, window.location.origin).pathname);
    } catch {
      return normalize(href);
    }
  };

  const findIndexFromPath = (path) => {
    const n = normalize(path);
    let idx = links.findIndex((l) => resolveHref(l.href) === n);
    if (idx !== -1) return idx;
    idx = links.findIndex((l) => l.href !== "/" && n.startsWith(resolveHref(l.href)));
    return idx !== -1 ? idx : 0;
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
      const idx = findIndexFromPath(window.location.pathname);
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
  }, [activeIndex]);

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

  return (
    <nav ref={navRef} className="relative px-6 py-4 z-50 flex justify-between md:block">
      {/* Bouton hamburger mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 flex flex-col gap-1 p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span
          className={`block w-6 h-0.5 transition-transform duration-300 ${isOpen || theme === 'dark' ? 'bg-white' : 'bg-black'}`}
          style={{ transform: isOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }}
        />
        <span
          className={`block w-6 h-0.5 transition-opacity duration-300 ${isOpen || theme === 'dark' ? 'bg-white' : 'bg-black'}`}
          style={{ opacity: isOpen ? 0 : 1 }}
        />
        <span
          className={`block w-6 h-0.5 transition-transform duration-300 ${isOpen || theme === 'dark' ? 'bg-white' : 'bg-black'}`}
          style={{ transform: isOpen ? "rotate(-45deg) translate(5px, -5px)" : "none" }}
        />
      </button>

      {/* Theme Toggle Mobile (Right side) */}
      <button
        onClick={toggleTheme}
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-full text-black dark:text-white cursor-pointer"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      </button>

      {/* Overlay mobile animé */}
      <div
        className={`fixed inset-0 bg-transparent bg-opacity-30 backdrop-blur-sm md:hidden z-40 transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Menu mobile slide-in/out */}
      <ul
        className={`fixed top-0 left-0 w-full h-[100dvh] md:h-screen bg-white/90 dark:bg-black/90 backdrop-blur-sm z-45 flex flex-col justify-center items-center gap-8 p-8 transform transition-transform duration-300 md:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        style={{ height: "calc(var(--vh, 1vh) * 100)" }}
      >
        {links.map((link, i) => (
          <li key={link.href} className="w-full flex justify-center">
            <a
              href={link.href}
              ref={(el) => (linkRefs.current[i] = el)}
              className={`font-sans text-lg tracking-wide transition-colors duration-300 ease-in-out text-center ${activeIndex === i
                ? "text-pink-400 font-semibold underline underline-offset-4 decoration-pink-400"
                : "text-black dark:text-white hover:text-pink-400"
                }`}
              onClick={() => handleClick(i)}
            >
              {link.name}
            </a>
          </li>
        ))}
      </ul>

      {/* Menu desktop */}
      <div className="hidden md:flex md:flex-row md:items-center md:justify-between">
        <ul ref={ulRef} className="flex flex-row gap-x-8 relative">
          {links.map((link, i) => (
            <li key={link.href} className="relative flex flex-col items-center md:items-start">
              <a
                href={link.href}
                ref={(el) => (linkRefs.current[i] = el)}
                className={`font-sans pb-0.5 transition-colors duration-400 ease-in-out ${activeIndex === i
                  ? "text-black dark:text-white"
                  : "text-black/50 dark:text-white/50 hover:text-pink-400"
                  }`}
                onClick={() => handleClick(i)}
              >
                {link.name}
              </a>
            </li>
          ))}
          {/* Slider desktop */}
          <span
            className="absolute bottom-0 h-[0.7px] bg-pink-400 rounded transition-all duration-200 hidden md:block"
            style={{
              left: sliderStyle.left,
              width: sliderStyle.width,
            }}
          />
        </ul>

        {/* Theme Toggle Desktop */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-black dark:text-white cursor-pointer"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </nav>
  );
}