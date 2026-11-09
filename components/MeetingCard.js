'use client';
import { CalendarDays, Clock, MapPin } from 'lucide-react';
import Badge from './Badge';
import { fmtDate, t5 } from '../lib/helpers';
import { useLang } from './LanguageProvider';

// Phone replacement for a table row
export default function MeetingCard({ m, onOpen }) {
  const { lang } = useLang();
  return (
    <button onClick={() => onOpen(m['Meeting ID'])} className="w-full text-left p-4 hover:bg-slate-50 active:bg-slate-100 transition space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="font-mono text-[11px] font-bold text-slate-500 block">{m['Meeting ID']}</span>
          <span className="font-semibold text-slate-900 break-words">{m['Nama Meeting']}</span>
        </div>
        <span className="shrink-0"><Badge status={m.Status} /></span>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5 text-slate-400" />{fmtDate(m.Tanggal, lang)}</span>
        <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" />{t5(m.Mulai)} - {t5(m.Selesai)}</span>
        <span className="inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" />{m.Ruangan}</span>
      </div>
    </button>
  );
}
