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
  const linkRefs = useRef([]);
  const ulRef = useRef(null);

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
    requestAnimationFrame(() => {
      const activeLink =
        linkRefs.current[index] ||
        ulRef.current?.querySelectorAll("a")?.[index];
      const ul = ulRef.current;
      if (!activeLink || !ul) return;
      const linkRect = activeLink.getBoundingClientRect();
      const ulRect = ul.getBoundingClientRect();
      setSliderStyle({
        width: linkRect.width,
        left: linkRect.left - ulRect.left,
      });
    });
  };

  useEffect(() => {
    const handleNavigation = () => {
      const idx = findIndexFromPath(window.location.pathname);
      setActiveIndex(idx);
      updateSlider(idx);
    };

    const handleResize = () => {
      const idx = findIndexFromPath(window.location.pathname);
      updateSlider(idx);
    };

    handleNavigation();

    window.addEventListener("astro:after-swap", handleNavigation);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("astro:after-swap", handleNavigation);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleClick = (i) => {
    setActiveIndex(i);
    updateSlider(i);
  };

  return (
    <nav className="relative px-6 py-4 z-10">
      <ul ref={ulRef} className="flex gap-8 relative">
        {links.map((link, i) => (
          <li key={link.href} className="relative flex flex-col items-center">
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

        <span
          className="absolute bottom-0 h-[0.7px] bg-white rounded transition-all duration-200"
          style={{
            left: sliderStyle.left,
            width: sliderStyle.width,
          }}
        />
      </ul>
    </nav>
  );
}