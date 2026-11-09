'use client';
import { useMemo, useState } from 'react';
import { ChevronRight, RefreshCw, Search } from 'lucide-react';
import RangeFilter from './RangeFilter';
import { attendanceRecords, employeeStats, summarize } from '../lib/attendance';
import { useLang } from './LanguageProvider';

const card = 'bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm';

export default function Attendance({ meetings, participants, employees, range, onRangeChange, onOpenEmployee, onRefresh }) {
  const { t } = useLang();
  const [sort, setSort] = useState('rate');
  const [showAll, setShowAll] = useState(false);
  const [q, setQ] = useState('');

  const records = useMemo(() => attendanceRecords(meetings, participants, range), [meetings, participants, range]);
  const total = useMemo(() => summarize(records), [records]);
  const people = useMemo(() => employeeStats(records).filter((e) => e.attended > 0).sort((a, b) =>
    sort === 'rate' ? b.rate - a.rate || b.taps - a.taps || a.name.localeCompare(b.name)
                    : b.taps - a.taps || b.rate - a.rate || a.name.localeCompare(b.name)), [records, sort]);
  const info = (n) => employees.find((e) => e.Nama === n) || {};
  // rank comes from the full sorted list, so it stays the same while searching
  const ranked = people.map((e, i) => ({ ...e, rank: i + 1 }));
  const term = q.trim().toLowerCase();
  const filtered = term
    ? ranked.filter((e) => { const d = info(e.name); return [e.name, d.Departemen, d.Jabatan].some((v) => (v || '').toLowerCase().includes(term)); })
    : ranked;
  const shown = showAll ? filtered : filtered.slice(0, 10);
  const avgTaps = total.attended ? (total.taps / total.attended).toFixed(1) : '0.0';
  const seg = (on) => `px-3 py-1.5 text-xs font-semibold rounded-lg transition ${on ? 'bg-fuboru-red text-white' : 'text-slate-600 hover:text-slate-900'}`;

  return (
    <section className="p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('emp.title')}</h1>
          <p className="text-sm text-slate-500 max-w-2xl">{t('emp.sub')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <RangeFilter value={range} onChange={onRangeChange} />
          <button onClick={onRefresh} className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 shadow-sm">
            <RefreshCw className="w-3.5 h-3.5" /><span>{t('common.refresh')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={card}>
          <p className="text-xs font-medium text-slate-500">{t('emp.avgRate')}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">{Math.round(total.rate)}%</h3>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden"><div className="bg-fuboru-red h-full" style={{ width: `${total.rate}%` }} /></div>
          <span className="text-[11px] text-slate-400 font-medium block mt-1.5">{t('emp.rateSub', { a: total.attended, b: total.invited })}</span>
        </div>
        <div className={card}>
          <p className="text-xs font-medium text-slate-500">{t('emp.avgTaps')}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">{avgTaps}</h3>
          <span className="text-[11px] text-slate-400 font-medium">{t('emp.tapsSub', { n: total.taps })}</span>
        </div>
        <div className={card}>
          <p className="text-xs font-medium text-slate-500">{t('emp.active')}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">{people.length}</h3>
          <span className="text-[11px] text-slate-400 font-medium">{t('emp.activeSub')}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{t('emp.listTitle')}</h3>
            <p className="text-xs text-slate-500">{t('emp.listSub')}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">{t('emp.sortBy')}</span>
            <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
              <button onClick={() => setSort('rate')} className={seg(sort === 'rate')}>{t('emp.sortRate')}</button>
              <button onClick={() => setSort('taps')} className={seg(sort === 'taps')}>{t('emp.sortTaps')}</button>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-5 py-3 border-b border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('emp.search')}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-fuboru-red" />
          </div>
        </div>
        {shown.length === 0 && <p className="p-6 text-center text-xs text-slate-400">{t(people.length === 0 ? 'emp.empty' : 'pick.none')}</p>}
        <ul className="divide-y divide-slate-100">
          {shown.map((e) => {
            const d = info(e.name);
            return (
              <li key={e.name}>
                <button onClick={() => onOpenEmployee(e.name)} className="w-full text-left px-4 sm:px-5 py-3.5 hover:bg-slate-50 active:bg-slate-100 transition flex flex-wrap items-center gap-x-6 gap-y-3">
                  <div className="flex items-center gap-3 basis-full md:basis-0 md:flex-1 min-w-0">
                    <span className="w-7 h-7 shrink-0 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">{e.rank}</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{e.name}</p>
                      <p className="text-xs text-slate-500 truncate">{d.Departemen || '-'} • {d.Jabatan || '-'}</p>
                    </div>
                  </div>
                  <div className="w-24"><p className="text-[10px] uppercase font-semibold text-slate-400">{t('emp.meetings')}</p><p className="text-sm font-semibold text-slate-800">{e.attended} / {e.invited}</p></div>
                  <div className="w-36 sm:w-44">
                    <p className="text-[10px] uppercase font-semibold text-slate-400">{t('emp.rate')}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden"><div className="bg-fuboru-red h-full" style={{ width: `${e.rate}%` }} /></div>
                      <span className="text-sm font-semibold text-slate-800 w-10 text-right">{Math.round(e.rate)}%</span>
                    </div>
                  </div>
                  <div className="w-14"><p className="text-[10px] uppercase font-semibold text-slate-400">{t('emp.taps')}</p><p className="text-sm font-semibold text-slate-800">{e.taps}</p></div>
                  <ChevronRight className="w-4 h-4 text-slate-300 hidden md:block" />
                </button>
              </li>
            );
          })}
        </ul>

        {filtered.length > 10 && (
          <div className="p-3 border-t border-slate-100 text-center">
            <button onClick={() => setShowAll(!showAll)} className="text-xs font-semibold text-fuboru-red hover:text-fuboru-redHover">
              {showAll ? t('emp.showTop') : t('emp.viewAll', { n: filtered.length })}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
