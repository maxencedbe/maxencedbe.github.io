import { useLocale } from './useLocale.js';

export default function Footer() {
  const locale = useLocale();

  return (
    <footer className="relative w-full px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] flex items-center justify-center z-10 overflow-hidden">
      {/* Dynamic Glass Background */}
      <div
        className="absolute inset-0 -z-10 backdrop-blur-sm border-t-[0.5px] border-black/10 dark:border-white/10"
        style={{
          WebkitBackdropFilter: "blur(8px)",
          backdropFilter: "blur(8px)",
        }}
      />

      {/* Copyright — the social links that used to sit here now live in the
          Connect section, where they replaced the filler paragraph. */}
      <p data-locale-fade className="text-sm font-semibold tracking-wide text-black dark:text-white text-center">
        &copy; {new Date().getFullYear()} Maxence Debes. {locale === 'fr' ? 'Tous droits réservés.' : 'All rights reserved.'}
      </p>
    </footer>
  );
}