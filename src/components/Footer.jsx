export default function Footer({ currentLocale = 'en' }) {
  const links = [
    { name: "LinkedIn", url: "https://www.linkedin.com/in/maxence-debes", label: "LinkedIn" },
    { name: "GitHub", url: "https://github.com/maxencedbe", label: "GitHub" },
    { name: "Mail", url: "mailto:maxence.debes@polytechnique.edu", label: currentLocale === 'fr' ? 'Email' : 'Email' },
  ];

  return (
    <footer className="relative w-full px-6 py-4 flex flex-col sm:flex-row items-center justify-between sm:justify-center z-10 overflow-hidden mt-8 md:mt-0">
      {/* Dynamic Glass Background */}
      <div
        className="absolute inset-0 -z-10 bg-white/5 dark:bg-black/5 backdrop-blur-sm border-t-[0.5px] border-black/10 dark:border-white/10"
        style={{
          WebkitBackdropFilter: "blur(8px)",
          backdropFilter: "blur(8px)",
        }}
      />

      {/* LEFT OF CENTER: Copyright */}
      <div className="flex-1 flex sm:justify-end justify-center mb-4 sm:mb-0 pr-0 sm:pr-6">
        <p className="text-sm font-semibold tracking-wide text-black dark:text-white text-center sm:text-right">
          &copy; {new Date().getFullYear()} Maxence Debes. All rights reserved.
        </p>
      </div>

      {/* CENTER: Vertical Divider (Hidden on Mobile) */}
      <div className="hidden sm:block w-[1px] h-4 bg-black/20 dark:bg-white/20"></div>

      {/* RIGHT OF CENTER: Text Links */}
      <div className="flex-1 flex sm:justify-start justify-center gap-6 pl-0 sm:pl-6">
        {links.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold tracking-wide text-black dark:text-white hover:text-pink-500 dark:hover:text-pink-400 transition-colors"
            aria-label={link.name}
          >
            {link.label}
          </a>
        ))}
      </div>
    </footer>
  );
}