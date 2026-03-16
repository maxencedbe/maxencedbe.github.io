import React, { useState, useEffect } from 'react';

const SideNav = ({ currentLocale = "en" }) => {
  const [activeSection, setActiveSection] = useState('home');

  const links = [
    { id: 'home', label: currentLocale === 'fr' ? 'Accueil' : 'Home' },
    { id: 'about', label: currentLocale === 'fr' ? 'À propos' : 'About' },
    { id: 'projects', label: currentLocale === 'fr' ? 'Projets' : 'Projects' },
    { id: 'contact', label: 'Contact' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;

      // Get all sections
      const sections = links.map(link => {
        const element = document.getElementById(link.id);
        if (!element) return null;
        return {
          id: link.id,
          top: element.offsetTop,
          bottom: element.offsetTop + element.offsetHeight
        };
      }).filter(Boolean);

      // Find the current active section
      // Add a slight offset (e.g., 200px) so it triggers slightly before reaching the exact top
      const current = sections.find(section => {
        return scrollPosition >= section.top - 200 && scrollPosition < section.bottom - 200;
      });

      if (current) {
        // Only update if it actually changed to avoid unnecessary re-renders
        if (activeSection !== current.id) {
          setActiveSection(current.id);
        }
      } else if (scrollPosition < 100) {
        // Fallback for the very top of the page
        setActiveSection('home');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on mount to set initial state
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

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col items-center gap-4">
      {links.map((link) => {
        const isActive = activeSection === link.id;
        return (
          <a
            key={link.id}
            href={`#${link.id}`}
            onClick={(e) => handleClick(e, link.id)}
            className="group relative flex items-center justify-end w-8 h-8 focus:outline-none"
            aria-label={`Scroll to ${link.label}`}
          >
            {/* Tooltip on hover */}
            <span
              className={`absolute right-10 px-2 py-1 bg-black dark:bg-white text-white dark:text-black text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap
                ${isActive ? 'font-bold' : 'font-normal'}
              `}
            >
              {link.label}
            </span>

            {/* The Dot */}
            <div
              className={`rounded-full transition-all duration-300 ease-in-out
                ${isActive
                  ? 'w-3 h-3 bg-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]'
                  : 'w-2 h-2 bg-neutral-300 dark:bg-neutral-600 group-hover:bg-neutral-400 dark:group-hover:bg-neutral-500 group-hover:scale-125'
                }
              `}
            />
          </a>
        );
      })}
    </div>
  );
};

export default SideNav;
