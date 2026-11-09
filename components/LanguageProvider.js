'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { dict } from '../lib/i18n';

const Ctx = createContext({ lang: 'en', setLang: () => {}, t: (k) => k });

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('en');

  // Restore the saved choice after load (keeps server and browser HTML identical)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lang');
      if (saved === 'en' || saved === 'id') setLangState(saved);
    } catch {}
  }, []);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const setLang = useCallback((l) => {
    setLangState(l);
    try { localStorage.setItem('lang', l); } catch {}
  }, []);

  const t = useCallback((key, vars = {}) => {
    let s = dict[lang][key] ?? dict.en[key] ?? key;
    for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
    return s;
  }, [lang]);

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
