'use client';
import { useLang } from './LanguageProvider';
import { useMemo, useState } from 'react';
import { ChevronRight, RefreshCw } from 'lucide-react';
import Badge from './Badge';
import MeetingCard from './MeetingCard';
import { fmtDate, t5 } from '../lib/helpers';

const CARDS = [
  { key: 'Planned', text: 'text-blue-600', dot: 'bg-blue-500', sub: 'dash.upcoming' },
  { key: 'Ongoing', text: 'text-amber-600', dot: 'bg-amber-500 animate-pulse', sub: 'dash.inProgress' },
  { key: 'Completed', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  { key: 'Canceled', text: 'text-rose-600', dot: 'bg-rose-500' },
];
const BAR = [['Completed', 'bg-emerald-500'], ['Planned', 'bg-blue-400'], ['Ongoing', 'bg-amber-400'], ['Canceled', 'bg-rose-500']];

export default function Dashboard({ meetings, onOpen, onNavigate, onRefresh }) {
  const { t, lang } = useLang();
  const [mode, setMode] = useState('month');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const list = useMemo(() => {
    if (mode === 'month') {
      const n = new Date();
      const ym = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
      return meetings.filter((m) => m.Tanggal.startsWith(ym));
    }
    return meetings.filter((m) => (!from || m.Tanggal >= from) && (!to || m.Tanggal <= to));
  }, [meetings, mode, from, to]);

  const total = list.length;
  const count = (s) => list.filter((m) => m.Status === s).length;
  const frac = (v) => (total ? (v / total) * 100 : 0);
  const pct = (v) => Math.round(frac(v));
  const recents = meetings.slice(0, 5);

  const tab = (on) => `px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${on ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`;

  return (
    <section className="p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('dash.title')}</h1>
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <button onClick={() => setMode('month')} className={tab(mode === 'month')}>{t('dash.thisMonth')}</button>
            <button onClick={() => setMode('custom')} className={tab(mode === 'custom')}>{t('dash.custom')}</button>
          </div>
          {mode === 'custom' && (
            <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-xl p-1 text-xs shadow-sm">
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="px-2 py-1 border border-slate-200 rounded-lg text-xs focus:outline-none" />
              <span className="text-slate-400">{t('common.to')}</span>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="px-2 py-1 border border-slate-200 rounded-lg text-xs focus:outline-none" />
            </div>
          )}
          <button onClick={onRefresh} className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 shadow-sm">
            <RefreshCw className="w-3.5 h-3.5" /><span>{t('common.refresh')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="col-span-2 md:col-span-1 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-medium text-slate-500">{t('dash.total')}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">{total}</h3>
          <span className="text-[11px] text-slate-400 font-medium">{t('dash.inRange')}</span>
        </div>
        {CARDS.map((c) => (
          <div key={c.key} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <p className={`text-xs font-medium flex items-center justify-between ${c.text}`}>
              <span>{t('status.' + c.key)}</span><span className={`w-2 h-2 rounded-full ${c.dot}`} />
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-2">{count(c.key)}</h3>
            <span className={`text-[11px] font-medium ${c.sub ? 'text-slate-400' : c.text}`}>
              {c.sub ? t(c.sub) : c.key === 'Completed' ? t('dash.successRate', { n: pct(count(c.key)) }) : t('dash.canceledPct', { n: pct(count(c.key)) })}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{t('dash.breakdownTitle')}</h3>
            <p className="text-xs text-slate-500">{t('dash.breakdownSub')}</p>
          </div>
          <span className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1 rounded-lg font-semibold">{t('dash.completedOf', { a: count('Completed'), b: total })}</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden flex my-4 border border-slate-200">
          {BAR.map(([k, color]) => <div key={k} title={t('status.' + k)} className={`${color} h-full transition-all duration-500`} style={{ width: `${frac(count(k))}%` }} />)}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-slate-100">
          {BAR.map(([k, color]) => (
            <div key={k} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded ${color}`} />
              <div><p className="text-[11px] text-slate-500">{t('status.' + k)}</p><p className="text-xs font-bold text-slate-800">{count(k)} ({pct(count(k))}%)</p></div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{t('dash.recentTitle')}</h3>
            <p className="text-xs text-slate-500">{t('dash.recentSub')}</p>
          </div>
          <button onClick={() => onNavigate('meetings')} className="text-xs font-semibold text-fuboru-red hover:text-fuboru-redHover flex items-center space-x-1">
            <span>{t('dash.viewAll')}</span><ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-slate-500 font-medium text-xs border-b border-slate-100">
              <tr>{['dash.colTitle', 'col.date', 'col.time', 'col.room', 'col.status'].map((h) => <th key={h} className="px-6 py-3">{t(h)}</th>)}<th className="px-6 py-3 text-right">{t('col.action')}</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recents.length === 0 && <tr><td colSpan={6} className="px-6 py-4 text-center text-xs text-slate-400">{t('dash.empty')}</td></tr>}
              {recents.map((m) => (
                <tr key={m['Meeting ID']} onClick={() => onOpen(m['Meeting ID'])} className="hover:bg-slate-50 cursor-pointer transition">
                  <td className="px-6 py-3.5"><span className="font-mono text-xs font-bold text-slate-900 block">{m['Meeting ID']}</span><span className="font-medium text-slate-700">{m['Nama Meeting']}</span></td>
                  <td className="px-6 py-3.5 text-xs text-slate-600 font-medium">{fmtDate(m.Tanggal, lang)}</td>
                  <td className="px-6 py-3.5 text-xs text-slate-600 font-mono">{t5(m.Mulai)} - {t5(m.Selesai)}</td>
                  <td className="px-6 py-3.5 text-xs text-slate-600">{m.Ruangan}</td>
                  <td className="px-6 py-3.5"><Badge status={m.Status} /></td>
                  <td className="px-6 py-3.5 text-right text-xs font-semibold text-fuboru-red">{t('dash.viewDetails')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="md:hidden divide-y divide-slate-100">
          {recents.length === 0 && <p className="p-4 text-center text-xs text-slate-400">{t('dash.empty')}</p>}
          {recents.map((m) => <MeetingCard key={m['Meeting ID']} m={m} onOpen={onOpen} />)}
        </div>
      </div>
    </section>
  );
}
