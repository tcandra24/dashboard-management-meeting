'use client';
import { useLang } from './LanguageProvider';

// Attended / Absent switch for one participant. It only changes the "Hadir" status;
// the tap count is never touched (handled in MeetingDetail).
export default function AttendanceSelect({ p, onChange, busy }) {
  const { t } = useLang();
  const attended = !!p.Hadir;
  return (
    <select value={attended ? 'yes' : 'no'} disabled={busy} title={t('det.changeAttendance')}
      onChange={(e) => onChange(e.target.value === 'yes')}
      className={`rounded-full text-xs font-semibold px-2.5 py-1 border cursor-pointer focus:outline-none focus:ring-2 focus:ring-fuboru-red disabled:opacity-60 ${attended ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
      <option value="yes">{t('det.attendedBadge')}</option>
      <option value="no">{t('det.absent')}</option>
    </select>
  );
}
