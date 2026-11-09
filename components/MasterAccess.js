'use client';
import { useEffect, useRef, useState } from 'react';
import { KeyRound, Search, Trash2, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { fmtDate } from '../lib/helpers';
import { useLang } from './LanguageProvider';

// Employees listed here can open every room at any time, with no meeting needed (the door function checks this table first).
export default function MasterAccess({ access, employees, notify, reload }) {
  const { t, lang } = useLang();
  const [q, setQ] = useState('');
  const [picked, setPicked] = useState(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const box = useRef(null);

  useEffect(() => {
    const close = (e) => { if (box.current && !box.current.contains(e.target)) setQ(''); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const granted = new Set(access.map((a) => a['Employee ID']));
  const term = q.trim().toLowerCase();
  const hits = term
    ? employees.filter((e) => !granted.has(e['Employee ID']) &&
        [e.Nama, e.Departemen, e.Jabatan].some((v) => (v || '').toLowerCase().includes(term))).slice(0, 30)
    : [];
  const info = (id) => employees.find((e) => e['Employee ID'] === id) || {};
  const rows = [...access].sort((a, b) => (b['Added At'] || '').localeCompare(a['Added At'] || ''));

  async function add() {
    if (!picked) return;
    setBusy(true);
    const { error } = await supabase.from('master_access').insert({ 'Employee ID': picked['Employee ID'], Note: note.trim() || null });
    setBusy(false);
    if (error) return notify(error.message);
    notify(t('mst.added', { name: picked.Nama }), true);
    setPicked(null); setNote(''); setQ('');
    await reload();
  }

  async function remove(a) {
    const name = info(a['Employee ID']).Nama || a['Employee ID'];
    if (!window.confirm(t('mst.confirmRemove', { name }))) return;
    const { data, error } = await supabase.from('master_access').delete().eq('id', a.id).select();
    if (error) return notify(error.message);
    if (!data.length) return notify(t('err.blockedDelete'));
    notify(t('mst.removed'), true);
    await reload();
  }

  return (
    <section className="p-4 sm:p-6 md:p-8 max-w-4xl w-full mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('mst.title')}</h1>
        <p className="text-sm text-slate-500 max-w-2xl">{t('mst.sub')}</p>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-base font-semibold text-slate-900">{t('mst.addTitle')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative" ref={box}>
            {picked ? (
              <div className="flex items-center justify-between gap-2 px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm">
                <span className="min-w-0 truncate"><b>{picked.Nama}</b> <span className="text-xs text-slate-500">{picked.Departemen || '-'} • {picked.Jabatan || '-'}</span></span>
                <button onClick={() => setPicked(null)} className="text-slate-400 hover:text-rose-500"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <>
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('mst.search')}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-fuboru-red" />
                {term && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 max-h-52 overflow-y-auto custom-scrollbar divide-y divide-slate-100">
                    {hits.length ? hits.map((e) => (
                      <div key={e['Employee ID']} onClick={() => { setPicked(e); setQ(''); }} className="p-2.5 hover:bg-slate-50 cursor-pointer text-xs">
                        <p className="font-semibold text-slate-800">{e.Nama}</p>
                        <p className="text-[10px] text-slate-500">{e.Departemen || t('pick.general')} • {e.Jabatan || t('pick.staff')}</p>
                      </div>
                    )) : <div className="p-3 text-xs text-slate-400 text-center">{t('pick.none')}</div>}
                  </div>
                )}
              </>
            )}
          </div>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('mst.note')} maxLength={80}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-fuboru-red" />
        </div>
        <div className="flex justify-end">
          <button onClick={add} disabled={!picked || busy}
            className="px-5 py-2.5 rounded-xl bg-fuboru-red hover:bg-fuboru-redHover disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-sm transition flex items-center space-x-2">
            <KeyRound className="w-4 h-4" /><span>{t('mst.grant')}</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">{t('mst.listTitle')}</h3>
        </div>
        {rows.length === 0 && <p className="p-6 text-center text-xs text-slate-400">{t('mst.empty')}</p>}
        <ul className="divide-y divide-slate-100">
          {rows.map((a) => {
            const e = info(a['Employee ID']);
            return (
              <li key={a.id} className="px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{e.Nama || a['Employee ID']}</p>
                  <p className="text-xs text-slate-500 truncate">{e.Departemen || '-'} • {e.Jabatan || '-'}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {a.Note && <span className="inline-flex px-2 py-0.5 mr-2 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">{a.Note}</span>}
                    {t('mst.addedOn', { date: fmtDate((a['Added At'] || '').slice(0, 10), lang) })}
                  </p>
                </div>
                <button onClick={() => remove(a)} title={t('mst.remove')} className="shrink-0 p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
