'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarPlus, LayoutDashboard, ListTodo, Menu, Users, KeyRound } from 'lucide-react';
import LanguageToggle from './LanguageToggle';
import { useLang } from './LanguageProvider';
import { useApp } from './AppProvider';
import { PATHS } from '../lib/routes';

const NAV = [
  { id: 'dashboard', key: 'nav.dashboard', Icon: LayoutDashboard },
  { id: 'schedule', key: 'nav.schedule', Icon: CalendarPlus },
  { id: 'meetings', key: 'nav.meetings', Icon: ListTodo },
  { id: 'attendance', key: 'nav.attendance', Icon: Users },
  { id: 'master', key: 'nav.master', Icon: KeyRound },
];

// The menu item that matches the current URL (detail pages belong to their section)
const activeFor = (pathname) =>
  NAV.find((n) => n.id !== 'dashboard' && pathname.startsWith(PATHS[n.id]))?.id || 'dashboard';

export default function AppShell({ children }) {
  const { t } = useLang();
  const { loading, toast } = useApp();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const mainRef = useRef(null);
  const activeNav = activeFor(pathname);

  // New page: close the phone menu and start at the top
  useEffect(() => { setMenuOpen(false); mainRef.current?.scrollTo(0, 0); }, [pathname]);

  return (
    <div className="h-[100dvh] flex overflow-hidden bg-slate-50">
      {menuOpen && <div className="fixed inset-0 bg-slate-900/40 z-30 md:hidden" onClick={() => setMenuOpen(false)} />}
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 transition-transform duration-200 md:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          <div className="px-5 py-5 border-b border-slate-100 flex items-center justify-center">
            <Link href={PATHS.dashboard} className="focus:outline-none w-full flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Fuboru Automotive Parts Logo" className="h-12 w-auto object-contain max-w-full"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/300x100/ffffff/e31e24?text=FUBORU'; }} />
            </Link>
          </div>
          <nav className="mt-4 space-y-1">
            {NAV.map(({ id, key, Icon }) => (
              <Link key={id} href={PATHS[id]}
                className={`w-full flex items-center space-x-3 px-6 py-3 text-sm transition border-l-4 ${activeNav === id ? 'bg-red-50 text-fuboru-red font-semibold border-fuboru-red' : 'border-transparent text-slate-600 font-medium hover:bg-slate-50'}`}>
                <Icon className="w-5 h-5" /><span>{t(key)}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div>
          <div className="px-4 pb-4"><LanguageToggle /></div>
          <div className="p-4 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400 font-medium">Fuboru Meeting System v1.0</span>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="md:hidden flex items-center justify-between px-3 h-14 bg-white border-b border-slate-200 shrink-0">
          <button onClick={() => setMenuOpen(true)} aria-label="Menu" className="p-2 rounded-lg text-slate-700 hover:bg-slate-100"><Menu className="w-6 h-6" /></button>
          <span className="text-sm font-bold text-slate-900">{t(NAV.find((n) => n.id === activeNav).key)}</span>
          <span className="w-10" />
        </header>
        <main ref={mainRef} className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? <p className="p-8 text-sm text-slate-400">{t('common.loading')}</p> : children}
        </main>
      </div>

      {toast && (
        <div className={`fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 z-[60] sm:max-w-sm px-4 py-3 rounded-xl text-xs font-semibold shadow-lg text-white ${toast.ok ? 'bg-emerald-600' : 'bg-rose-600'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
