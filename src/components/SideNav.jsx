import React, { useState, useEffect } from 'react';

const SideNav = ({ currentLocale = "en" }) => {
  const [activeSection, setActiveSection] = useState('home');
  const [hoveredId, setHoveredId] = useState(null);

  const links = [
    { id: 'home', label: currentLocale === 'fr' ? 'Accueil' : 'Home' },
    { id: 'about', label: currentLocale === 'fr' ? 'À propos' : 'About' },
    { id: 'projects', label: currentLocale === 'fr' ? 'Projets' : 'Projects' },
    { id: 'contact', label: 'Contact' }
  ];

  const activeIndex = links.findIndex(l => l.id === activeSection);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;

      const sections = links.map(link => {
        const element = document.getElementById(link.id);
        if (!element) return null;
        return {
          id: link.id,
          top: element.offsetTop,
          bottom: element.offsetTop + element.offsetHeight
        };
      }).filter(Boolean);

      const current = sections.find(section => {
        return scrollPosition >= section.top - 200 && scrollPosition < section.bottom - 200;
      });

      if (current) {
        if (activeSection !== current.id) {
          setActiveSection(current.id);
        }
      } else if (scrollPosition < 100) {
        setActiveSection('home');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection, links]);

  const handleClick = (e, id) => {
    e.preventDefault();
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Spacing between dot centers (gap-6 = 24px + dot area)
  // Each dot's clickable area is 16px tall, gap between = 24px → center-to-center = 40px
  const dotSize = 16; // h-4 = 16px
  const gapSize = 24; // gap between dots
  const dotSpacing = dotSize + gapSize; // 40px center-to-center
  const padTop = 4; // py-1 = 4px
  const firstDotCenter = padTop + dotSize / 2; // center of first dot
  const totalTrackHeight = (links.length - 1) * dotSpacing;
  const progressHeight = activeIndex * dotSpacing;

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex">
      <div className="relative flex flex-col items-center py-1 px-2">
        {/* Track line (from first dot center to last dot center) */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            top: `${firstDotCenter}px`,
            height: `${totalTrackHeight}px`,
            width: '1.5px',
            borderRadius: '1px',
          }}
          className="bg-neutral-300/15 dark:bg-neutral-600/15"
        />

        {/* Progress line (animated) */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            top: `${firstDotCenter}px`,
            height: `${progressHeight}px`,
            width: '1.5px',
            borderRadius: '1px',
            transition: 'height 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
            background: 'linear-gradient(to bottom, rgba(236,72,153,0.4), rgba(236,72,153,0.8))',
            boxShadow: '0 0 6px rgba(236,72,153,0.3)',
          }}
        />

        {/* Dots */}
        <div className="flex flex-col items-center" style={{ gap: `${gapSize}px` }}>
          {links.map((link, i) => {
            const isActive = activeSection === link.id;
            const isHovered = hoveredId === link.id;
            const isPassed = i <= activeIndex;

            return (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => handleClick(e, link.id)}
                onMouseEnter={() => setHoveredId(link.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="group relative flex items-center justify-center w-4 h-4 focus:outline-none"
                aria-label={`Scroll to ${link.label}`}
              >
                {/* Tooltip */}
                <span
                  style={{
                    transform: isHovered ? 'translateX(0) scale(1)' : 'translateX(8px) scale(0.9)',
                    opacity: isHovered ? 1 : 0,
                    transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                    pointerEvents: 'none',
                    position: 'absolute',
                    right: '28px',
                    whiteSpace: 'nowrap',
                    fontSize: '12px',
                    fontWeight: isActive ? 600 : 400,
                    letterSpacing: '0.05em',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                  }}
                  className="bg-black/70 dark:bg-white/90 text-white dark:text-black"
                >
                  {link.label}
                </span>

                {/* Outer ring (active) */}
                <div
                  style={{
                    position: 'absolute',
                    width: isActive ? '16px' : '0px',
                    height: isActive ? '16px' : '0px',
                    borderRadius: '50%',
                    border: '1.5px solid rgba(236,72,153,0.4)',
                    transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                    opacity: isActive ? 1 : 0,
                  }}
                />

                {/* Dot */}
                <div
                  style={{
                    width: isActive ? '8px' : isHovered ? '7px' : '5px',
                    height: isActive ? '8px' : isHovered ? '7px' : '5px',
                    borderRadius: '50%',
                    transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                    boxShadow: isActive
                      ? '0 0 12px rgba(236,72,153,0.8), 0 0 4px rgba(236,72,153,0.4)'
                      : 'none',
                  }}
                  className={
                    isActive
                      ? 'bg-pink-500'
                      : isPassed
                        ? 'bg-pink-400/60'
                        : 'bg-neutral-400 dark:bg-neutral-500 group-hover:bg-neutral-300 dark:group-hover:bg-neutral-400'
                  }
                />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SideNav;
