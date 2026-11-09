import { supabase } from './supabaseClient';

export const STATUSES = ['Planned', 'Ongoing', 'Completed', 'Canceled'];
export const t5 = (t) => (t || '').slice(0, 5);
export const fmtDate = (d, lang = 'en') =>
  d ? new Date(d + 'T00:00:00').toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
// "Mulai Aktual" / "Selesai Aktual" are timestamps ("2026-10-29T14:03:12"): show HH:MM, and add the date only if it differs from the planned date
export const fmtActual = (ts, plannedDate, lang = 'en') => {
  if (!ts) return '-';
  const date = ts.slice(0, 10), time = ts.slice(11, 16);
  return date === plannedDate ? time : `${fmtDate(date, lang)} ${time}`;
};
export const byDateDesc = (a, b) => (b.Tanggal + b.Mulai).localeCompare(a.Tanggal + a.Mulai);
export const isOverlapErr = (e) => e && (e.code === '23P01' || /meeting_no_overlap/.test(e.message || ''));

// Looks for a non-canceled meeting in the same room that overlaps the given time (live from the DB)
export async function findCollision(room, date, start, end, excludeId = null) {
  const { data, error } = await supabase
    .from('meeting').select('*')
    .eq('Ruangan', room).eq('Tanggal', date).neq('Status', 'Canceled');
  if (error) throw error;
  return (data || []).find((m) => m['Meeting ID'] !== excludeId && start < t5(m.Selesai) && end > t5(m.Mulai));
}

export const overlapMsg = (room, c, t) =>
  t('err.booked', { room, name: c['Nama Meeting'], start: t5(c.Mulai), end: t5(c.Selesai) });

export const ATT_BUCKET = 'meeting-files';
export const ATT_MAX = 50 * 1024 * 1024; // 50 MB, same limit as the bucket
export const fmtSize = (b) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
