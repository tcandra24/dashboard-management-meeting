'use client';
import { useMemo, useState } from 'react';
import { ArrowLeft, CalendarDays, Clock, MapPin } from 'lucide-react';
import RangeFilter from './RangeFilter';
import { attendanceRecords, summarize } from '../lib/attendance';
import { byDateDesc, fmtDate, t5 } from '../lib/helpers';
import { useLang } from './LanguageProvider';

const card = 'bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm';

export default function EmployeeDetail({ name, meetings, participants, employees, initialRange, onBack, onOpenMeeting, backLabel }) {
  const { t, lang } = useLang();
  const [range, setRange] = useState(initialRange);
  const [showAll, setShowAll] = useState(false);
  const emp = employees.find((e) => e.Nama === name) || {};

  const rows = useMemo(() => attendanceRecords(meetings, participants, range)
    .filter((r) => r.name === name).sort((a, b) => byDateDesc(a.meeting, b.meeting)), [meetings, participants, range, name]);
  const s = summarize(rows);
  const shown = showAll ? rows : rows.slice(0, 10);

  return (
    <section className="p-4 sm:p-6 md:p-8 max-w-5xl w-full mx-auto space-y-6">
      <button onClick={onBack} className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center space-x-1">
        <ArrowLeft className="w-4 h-4" /><span>{backLabel || t('emp.back')}</span>
      </button>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 break-words">{name}</h1>
          <p className="text-sm text-slate-500">{emp.Departemen || '-'} • {emp.Jabatan || '-'}</p>
        </div>
        <RangeFilter value={range} onChange={setRange} allowAll />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={card}>
          <p className="text-xs font-medium text-slate-500">{t('emp.rate')}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">{Math.round(s.rate)}%</h3>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden"><div className="bg-fuboru-red h-full" style={{ width: `${s.rate}%` }} /></div>
        </div>
        <div className={card}>
          <p className="text-xs font-medium text-slate-500">{t('emp.joined')}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">{s.attended} / {s.invited}</h3>
        </div>
        <div className={card}>
          <p className="text-xs font-medium text-slate-500">{t('emp.totalTaps')}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">{s.taps}</h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">{t('dash.recentTitle')}</h3>
          <p className="text-xs text-slate-500">{t('emp.recentSub')}</p>
        </div>
        {shown.length === 0 && <p className="p-6 text-center text-xs text-slate-400">{t('emp.noMeetings')}</p>}
        <ul className="divide-y divide-slate-100">
          {shown.map(({ meeting: m, taps, attended }) => (
            <li key={m['Meeting ID']}>
              <button onClick={() => onOpenMeeting(m['Meeting ID'])} className="w-full text-left p-4 hover:bg-slate-50 active:bg-slate-100 transition space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="font-mono text-[11px] font-bold text-slate-500 block">{m['Meeting ID']}</span>
                    <span className="font-semibold text-slate-900 break-words">{m['Nama Meeting']}</span>
                  </div>
                  <span className={`shrink-0 inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${attended ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                    {attended ? t('det.attendedBadge') : t('det.absent')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5 text-slate-400" />{fmtDate(m.Tanggal, lang)}</span>
                  <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" />{t5(m.Mulai)} - {t5(m.Selesai)}</span>
                  <span className="inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" />{m.Ruangan}</span>
                  <span className="text-slate-500">{t('col.taps')}: <b className={taps ? 'text-fuboru-red' : 'text-slate-400'}>{taps}</b></span>
                </div>
              </button>
            </li>
          ))}
        </ul>
        {rows.length > 10 && (
          <div className="p-3 border-t border-slate-100 text-center">
            <button onClick={() => setShowAll(!showAll)} className="text-xs font-semibold text-fuboru-red hover:text-fuboru-redHover">
              {showAll ? t('emp.showRecent') : t('emp.viewAll', { n: rows.length })}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
