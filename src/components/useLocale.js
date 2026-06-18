import { useState, useEffect } from 'react';

export function useLocale() {
  const [locale, setLocale] = useState(() =>
    typeof localStorage !== 'undefined' ? (localStorage.getItem('locale') || 'en') : 'en'
  );

  useEffect(() => {
    const handler = (e) => setLocale(e.detail.locale);
    document.addEventListener('locale-change', handler);
    return () => document.removeEventListener('locale-change', handler);
  }, []);

  return locale;
}
