'use client';
import { useLang } from './LanguageProvider';
import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

// Participants are stored by name (matches the participant table). selected = array of names.
export default function ParticipantPicker({ employees, selected, onChange }) {
  const { t } = useLang();
  const [q, setQ] = useState('');
  const box = useRef(null);

  useEffect(() => {
    const close = (e) => { if (box.current && !box.current.contains(e.target)) setQ(''); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const term = q.trim().toLowerCase();
  const hits = term
    ? employees.filter((e) => !selected.includes(e.Nama) &&
        [e.Nama, e.Departemen, e.Jabatan].some((v) => (v || '').toLowerCase().includes(term))).slice(0, 30)
    : [];

  return (
    <div className="space-y-3">
      <div className="relative" ref={box}>
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          value={q} onChange={(e) => setQ(e.target.value)}
          placeholder={t('pick.placeholder')}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-fuboru-red"
        />
        {term && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 max-h-52 overflow-y-auto custom-scrollbar divide-y divide-slate-100">
            {hits.length ? hits.map((e) => (
              <div key={e['Employee ID']} onClick={() => { onChange([...selected, e.Nama]); setQ(''); }}
                className="p-2.5 hover:bg-slate-50 cursor-pointer text-xs">
                <p className="font-semibold text-slate-800">{e.Nama}</p>
                <p className="text-[10px] text-slate-500">{e.Departemen || t('pick.general')} • {e.Jabatan || t('pick.staff')}</p>
              </div>
            )) : <div className="p-3 text-xs text-slate-400 text-center">{t('pick.none')}</div>}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 p-2 min-h-[42px] max-h-32 overflow-y-auto custom-scrollbar bg-slate-50 border border-slate-200 rounded-xl">
        {selected.length === 0 && <span className="text-xs text-slate-400 self-center px-1">{t('pick.empty')}</span>}
        {selected.map((n) => {
          const emp = employees.find((e) => e.Nama === n) || {};
          return (
            <span key={n} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 shadow-sm text-xs text-slate-800 font-medium">
              {n} <span className="text-[10px] text-slate-400">({emp.Departemen || t('pick.staff')})</span>
              <button type="button" onClick={() => onChange(selected.filter((x) => x !== n))} className="text-slate-400 hover:text-rose-500">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          );
        })}
      </div>
    </div>
  );
}
