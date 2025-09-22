import { useEffect, useRef, useState } from "react";

const links = [
  { name: "Home", href: "/" },
  { name: "About me", href: "/about" },
  { name: "Projects", href: "/projects" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0 });
  const linkRefs = useRef([]);
  const ulRef = useRef(null);

  function updateSlider(index) {
    const activeLink = linkRefs.current[index];
    const ul = ulRef.current;
    if (activeLink && ul) {
      const linkRect = activeLink.getBoundingClientRect();
      const ulRect = ul.getBoundingClientRect();
      setSliderStyle({
        width: linkRect.width,
        left: linkRect.left - ulRect.left,
      });
    }
  }

  function refreshActive() {
    const index = links.findIndex((link) => link.href === window.location.pathname);
    const newIndex = index >= 0 ? index : 0;
    setActiveIndex(newIndex);
    updateSlider(newIndex);
  }

  useEffect(() => {
    refreshActive();

    window.addEventListener("resize", () => updateSlider(activeIndex));
    window.addEventListener("astro:after-swap", refreshActive);

    return () => {
      window.removeEventListener("resize", () => updateSlider(activeIndex));
      window.removeEventListener("astro:after-swap", refreshActive);
    };
  }, []);

  return (
    <nav className="relative px-6 py-4 z-10">
      <ul ref={ulRef} className="flex gap-8 relative">
        {links.map((link, i) => (
          <li key={i} className="relative flex flex-col items-center">
            <a
              href={link.href}
              ref={(el) => (linkRefs.current[i] = el)}
              className={`font-sans transition-colors duration-400 ease-in-out
                ${activeIndex === i ? "text-white opacity-100" : "text-white/50 hover:text-pink-400"}`}
              onClick={() => setActiveIndex(i)}
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