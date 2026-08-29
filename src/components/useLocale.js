import { useState, useEffect } from 'react';

export function useLocale() {
  // Starts at the server-rendered default, deliberately, even when localStorage
  // already holds 'fr'. Seeding this state from localStorage instead made the
  // first client render disagree with the SSR HTML — the server had written
  // "All", the client rendered "Tout" — and React treats that as a hydration
  // failure: it discards the server markup and re-renders the whole island.
  // Every locale-aware island did this at once for a French visitor, which is
  // what made the site misbehave. The stored locale is applied just below, in
  // an effect, i.e. after hydration has matched.
  const [locale, setLocale] = useState('en');

  useEffect(() => {
    const stored = localStorage.getItem('locale');
    if (stored && stored !== 'en') setLocale(stored);

    const handler = (e) => setLocale(e.detail.locale);
    document.addEventListener('locale-change', handler);
    return () => document.removeEventListener('locale-change', handler);
  }, []);

  return locale;
}
