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
  const [isOpen, setIsOpen] = useState(false); // menu burger mobile
  const linkRefs = useRef([]);
  const ulRef = useRef(null);
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
    if (window.innerWidth < 768) return; // slider uniquement desktop

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

  const handleClick = (i) => {
    setActiveIndex(i);
    updateSlider(i);
    setIsOpen(false); // ferme le menu burger après clic sur mobile
  };

  return (
    <nav ref={navRef} className="relative px-6 py-4 z-10">
      {/* Bouton hamburger mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-30 flex flex-col gap-1 p-2"
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

      {/* Menu */}
      <ul
        ref={ulRef}
        className={`
          flex gap-8 relative
          md:flex-row md:static md:bg-transparent
          ${isOpen ? "flex flex-col fixed top-0 left-0 w-64 h-full p-6 bg-black bg-opacity-90 z-20" : "hidden md:flex"}
        `}
      >
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

        {/* Slider desktop uniquement */}
        <span
          className="absolute bottom-0 h-[0.7px] bg-white rounded transition-all duration-200 hidden md:block"
          style={{
            left: sliderStyle.left,
            width: sliderStyle.width,
            top: sliderStyle.top - 10,
          }}
        />
      </ul>

      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </nav>
  );
}
