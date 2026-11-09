'use client';
import { useLang } from './LanguageProvider';

// Pill switch: the filled thumb slides between EN and ID
export default function LanguageToggle() {
  const { lang, setLang } = useLang();
  const isId = lang === 'id';
  const label = (active) => `relative z-10 w-1/2 flex items-center justify-center text-xs font-bold transition-colors duration-300 ${active ? 'text-white' : 'text-fuboru-red'}`;
  return (
    <button type="button" role="switch" aria-checked={isId} aria-label="Language / Bahasa"
      onClick={() => setLang(isId ? 'en' : 'id')}
      className="relative mx-auto flex w-24 h-8 rounded-full border-2 border-fuboru-red bg-white overflow-hidden select-none focus:outline-none focus:ring-2 focus:ring-fuboru-red/30">
      <span className={`absolute top-0 left-0 h-full w-1/2 rounded-full bg-fuboru-red transition-transform duration-300 ease-out ${isId ? 'translate-x-full' : ''}`} />
      <span className={label(!isId)}>EN</span>
      <span className={label(isId)}>ID</span>
    </button>
  );
}
