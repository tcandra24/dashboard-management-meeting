'use client';
import { useLang } from './LanguageProvider';
import { useState } from 'react';
import { Plus, RefreshCw, Search } from 'lucide-react';
import Badge from './Badge';
import MeetingCard from './MeetingCard';
import { STATUSES, fmtDate, t5 } from '../lib/helpers';

export default function MeetingList({ meetings, onOpen, onNavigate, onRefresh }) {
  const { t, lang } = useLang();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('ALL');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const term = q.trim().toLowerCase();
  const rows = meetings.filter((m) => (status === 'ALL' || m.Status === status) &&
    (!from || m.Tanggal >= from) && (!to || m.Tanggal <= to) &&
    (!term || m['Nama Meeting'].toLowerCase().includes(term) || m['Meeting ID'].toLowerCase().includes(term)));

  return (
    <section className="p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('list.title')}</h1>
          <p className="text-sm text-slate-500">{t('list.sub')}</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button onClick={onRefresh} className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 shadow-sm">
            <RefreshCw className="w-3.5 h-3.5" /><span>{t('common.refresh')}</span>
          </button>
          <button onClick={() => onNavigate('schedule')} className="px-4 py-2 bg-fuboru-red hover:bg-fuboru-redHover text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-sm">
            <Plus className="w-4 h-4" /><span>{t('list.schedule')}</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('list.search')} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-fuboru-red" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">{t('list.dateRange')}</span>
            <input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} className="px-2 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-fuboru-red" />
            <span className="text-slate-400">{t('common.to')}</span>
            <input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className="px-2 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-fuboru-red" />
            {(from || to) && <button onClick={() => { setFrom(''); setTo(''); }} className="font-semibold text-fuboru-red hover:text-fuboru-redHover">{t('common.clear')}</button>}
          </div>
          <span className="text-xs text-slate-500 font-medium">{t('list.statusFilter')}</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-fuboru-red font-medium">
            <option value="ALL">{t('list.allStatuses')}</option>
            {STATUSES.map((s) => <option key={s} value={s}>{t('status.' + s)}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden overflow-x-auto hidden md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-medium text-xs border-b border-slate-100">
            <tr>{['list.colCode', 'list.colTitle', 'col.date', 'list.colTime', 'col.room', 'col.status'].map((h) => <th key={h} className="px-6 py-3.5">{t(h)}</th>)}<th className="px-6 py-3.5 text-right">{t('col.action')}</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 && <tr><td colSpan={7} className="px-6 py-6 text-center text-xs text-slate-400">{t('list.empty')}</td></tr>}
            {rows.map((m) => (
              <tr key={m['Meeting ID']} onClick={() => onOpen(m['Meeting ID'])} className="hover:bg-slate-50 cursor-pointer transition">
                <td className="px-6 py-3.5 font-mono text-xs font-bold text-slate-800">{m['Meeting ID']}</td>
                <td className="px-6 py-3.5 font-semibold text-slate-900">{m['Nama Meeting']}</td>
                <td className="px-6 py-3.5 text-xs text-slate-600">{fmtDate(m.Tanggal, lang)}</td>
                <td className="px-6 py-3.5 text-xs font-mono text-slate-600">{t5(m.Mulai)} - {t5(m.Selesai)}</td>
                <td className="px-6 py-3.5 text-xs text-slate-600">{m.Ruangan}</td>
                <td className="px-6 py-3.5"><Badge status={m.Status} /></td>
                <td className="px-6 py-3.5 text-right text-xs font-semibold text-fuboru-red">{t('list.details')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden divide-y divide-slate-100">
        {rows.length === 0 && <p className="p-6 text-center text-xs text-slate-400">{t('list.empty')}</p>}
        {rows.map((m) => <MeetingCard key={m['Meeting ID']} m={m} onOpen={onOpen} />)}
      </div>
    </section>
  );
}
