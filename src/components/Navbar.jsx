import { useEffect, useRef, useState } from "react";

const links = [
  { name: "Home", href: "/" },
  { name: "About me", href: "/about" },
  { name: "Projects", href: "/projects" },
  { name: "Contact", href: "/contact" },
];

function normalize(p) {
  if (!p) return "/";
  if (p.length > 1 && p.endsWith("/")) return p.slice(0, -1);
  return p;
}

export default function Navbar() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0 });
  const [isOpen, setIsOpen] = useState(false);
  const linkRefs = useRef([]);
  const navRef = useRef(null);

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
      const nav = navRef.current;
      if (!activeLink || !nav) return;

      const linkRect = activeLink.getBoundingClientRect();
      const navRect = nav.getBoundingClientRect();

      setSliderStyle({
        left: linkRect.left - navRect.left,
        width: linkRect.width,
        top: nav.offsetHeight - 2,
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
  };

  return (
    <nav ref={navRef} className="relative px-6 py-4 z-50">
      {/* Bouton hamburger mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 flex flex-col gap-1 p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span
          className="block w-6 h-0.5 bg-white transition-transform duration-300"
          style={{ transform: isOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }}
        />
        <span
          className="block w-6 h-0.5 bg-white transition-opacity duration-300"
          style={{ opacity: isOpen ? 0 : 1 }}
        />
        <span
          className="block w-6 h-0.5 bg-white transition-transform duration-300"
          style={{ transform: isOpen ? "rotate(-45deg) translate(5px, -5px)" : "none" }}
        />
      </button>

      {/* Overlay mobile animé */}
      <div
        className={`fixed inset-0 bg-transparent bg-opacity-30 backdrop-blur-sm md:hidden z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Menu mobile slide-in/out */}
      <ul
        className={`fixed top-0 left-0 w-full h-[100dvh] md:h-screen bg-black/40 backdrop-blur-sm backdrop-brightness-75 z-45 flex flex-col justify-center items-center gap-8 p-8 transform transition-transform duration-300 md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ height: "calc(var(--vh, 1vh) * 100)" }}
      >
        {links.map((link, i) => (
          <li key={link.href} className="w-full flex justify-center">
            <a
              href={link.href}
              ref={(el) => (linkRefs.current[i] = el)}
              className={`font-sans text-lg tracking-wide transition-colors duration-300 ease-in-out text-center ${
                activeIndex === i
                  ? "text-pink-400 font-semibold underline underline-offset-4 decoration-pink-400"
                  : "text-white hover:text-pink-400"
              }`}
              onClick={() => handleClick(i)}
            >
              {link.name}
            </a>
          </li>
        ))}
      </ul>

      {/* Menu desktop */}
      <ul className="hidden md:flex md:flex-row md:gap-x-8 md:static md:bg-transparent">
        {links.map((link, i) => (
          <li key={link.href} className="relative flex flex-col items-center md:items-start">
            <a
              href={link.href}
              ref={(el) => (linkRefs.current[i] = el)}
              className={`font-sans transition-colors duration-400 ease-in-out ${
                activeIndex === i ? "text-white opacity-100" : "text-white/50 hover:text-pink-400"
              }`}
              onClick={() => handleClick(i)}
            >
              {link.name}
            </a>
          </li>
        ))}

        {/* Slider desktop */}
        <span
          className="absolute bottom-0 h-[0.7px] bg-white rounded transition-all duration-200 hidden md:block"
          style={{
            left: sliderStyle.left,
            width: sliderStyle.width,
            top: sliderStyle.top - 12,
          }}
        />
      </ul>
    </nav>
  );
}