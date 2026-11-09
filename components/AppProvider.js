'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { byDateDesc } from '../lib/helpers';
import { useAutoRefresh } from '../lib/useAutoRefresh';
import { useLang } from './LanguageProvider';

// Holds the data every page needs, so it is loaded once and kept while you move between pages.
const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

export function AppProvider({ children }) {
  const { t } = useLang();
  const tRef = useRef(t);
  tRef.current = t; // lets load() use the latest language without reloading data
  const [data, setData] = useState({ rooms: [], employees: [], meetings: [], participants: [], access: [] });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [attRange, setAttRange] = useState({ mode: 'month', from: '', to: '' }); // shared by the Attendance and Employee pages

  const notify = useCallback((msg, ok = false) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 5000);
  }, []);

  const load = useCallback(async (silent = false) => {
    const [r, e, m, p, a] = await Promise.all([
      supabase.from('room').select('*'),
      supabase.from('employee').select('"Employee ID", "Nama", "Departemen", "Jabatan"'), // only the columns the UI needs
      supabase.from('meeting').select('*'),
      supabase.from('participant').select('*'),
      supabase.from('master_access').select('*'),
    ]);
    const failed = [r, e, m, p, a].find((x) => x.error);
    if (failed && !silent) notify(tRef.current('err.loadFailed', { err: failed.error.message }));
    setData({
      rooms: (r.data || []).sort((a, b) => a['Nama Ruangan'].localeCompare(b['Nama Ruangan'])),
      employees: (e.data || []).sort((a, b) => a.Nama.localeCompare(b.Nama)),
      meetings: (m.data || []).sort(byDateDesc),
      participants: p.data || [],
      access: a.data || [],
    });
    setLoading(false);
  }, [notify]);

  useEffect(() => { load(); }, [load]);
  useAutoRefresh(['meeting', 'participant', 'room', 'master_access'], () => load(true)); // live updates; silent so background errors don't pop up

  return (
    <Ctx.Provider value={{ data, loading, load, notify, toast, attRange, setAttRange }}>
      {children}
    </Ctx.Provider>
  );
}
