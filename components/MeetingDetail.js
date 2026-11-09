'use client';
import { useLang } from './LanguageProvider';
import { useState } from 'react';
import { ArrowLeft, Edit3, FileSpreadsheet, RefreshCw, Trash2 } from 'lucide-react';
import Badge from './Badge';
import Modal from './Modal';
import ParticipantPicker from './ParticipantPicker';
import Attachments from './Attachments';
import AttendanceSelect from './AttendanceSelect';
import { supabase } from '../lib/supabaseClient';
import { ATT_BUCKET, STATUSES, fmtDate, fmtActual, t5, findCollision, isOverlapErr, overlapMsg } from '../lib/helpers';

const field = 'w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-fuboru-red';
const lbl = 'block text-xs font-semibold text-slate-700 uppercase mb-1';
const actBtn = 'px-3.5 py-1.5 border rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm';

export default function MeetingDetail({ meeting: m, participants, employees, rooms, notify, reload, onBack, onDeleted, backLabel, onOpenEmployee }) {
  const { t, lang } = useLang();
  const id = m['Meeting ID'];
  const parts = participants.filter((p) => p['Meeting ID'] === id)
    .sort((a, b) => a['Nama Peserta'].localeCompare(b['Nama Peserta'], undefined, { sensitivity: 'base' })); // A-Z by name
  const attended = parts.filter((p) => p.Hadir).length;
  const [savingId, setSavingId] = useState(null);
  const pct = parts.length ? Math.round((attended / parts.length) * 100) : 0;

  const [modal, setModal] = useState(null); // 'edit' | 'status' | null
  const [form, setForm] = useState({});
  const [people, setPeople] = useState([]);
  const [status, setStatus] = useState(m.Status);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function openEdit() {
    setForm({ name: m['Nama Meeting'], date: m.Tanggal, room: m.Ruangan, start: t5(m.Mulai), end: t5(m.Selesai) });
    setPeople(parts.map((p) => p['Nama Peserta']));
    setModal('edit');
  }

  async function saveEdit(e) {
    e.preventDefault();
    if (form.start >= form.end) return notify(t('err.endBeforeStart'));
    try {
      if (m.Status !== 'Canceled') {
        const clash = await findCollision(form.room, form.date, form.start, form.end, id);
        if (clash) return notify(overlapMsg(form.room, clash, t));
      }
      const { data, error } = await supabase.from('meeting')
        .update({ 'Nama Meeting': form.name.trim(), Tanggal: form.date, Ruangan: form.room, Mulai: form.start, Selesai: form.end })
        .eq('Meeting ID', id).select();
      if (error) return notify(isOverlapErr(error) ? t('err.bookedGeneric') : error.message);
      if (!data.length) return notify(t('err.blockedUpdate'));

      const before = parts.map((p) => p['Nama Peserta']);
      const removed = before.filter((n) => !people.includes(n));
      const added = people.filter((n) => !before.includes(n));
      if (removed.length) {
        const { error: e1 } = await supabase.from('participant').delete().eq('Meeting ID', id).in('Nama Peserta', removed);
        if (e1) return notify(e1.message);
      }
      if (added.length) {
        const { error: e2 } = await supabase.from('participant')
          .insert(added.map((n) => ({ 'Meeting ID': id, 'Nama Peserta': n, 'Jumlah Tap': 0 })));
        if (e2) return notify(e2.message);
      }
      setModal(null); notify(t('msg.updated'), true); await reload();
    } catch (err) { notify(err.message); }
  }

  async function saveStatus() {
    const { data, error } = await supabase.from('meeting').update({ Status: status }).eq('Meeting ID', id).select();
    if (error) return notify(isOverlapErr(error) ? t('err.restore') : error.message);
    if (!data.length) return notify(t('err.blockedUpdate'));
    setModal(null); notify(t('msg.statusChanged', { s: t('status.' + status) }), true); await reload();
  }

  // Only the status changes; the tap count stays exactly as the door lock recorded it.
  async function setAttendance(p, attendedNow) {
    setSavingId(p.id);
    const { data, error } = await supabase.from('participant').update({ Hadir: attendedNow }).eq('id', p.id).select();
    setSavingId(null);
    if (error) return notify(error.message);
    if (!data.length) return notify(t('err.blockedUpdate'));
    await reload();
  }

  // Downloads <meeting code>.xlsx with the meeting info and the participant / tap table (in the current language)
  async function exportExcel() {
    try {
      const XLSX = await import('xlsx');
      const emp = (n) => employees.find((e) => e.Nama === n) || {};
      const info = [
        [t('list.colCode'), id], [t('f.name'), m['Nama Meeting']], [t('f.date'), fmtDate(m.Tanggal, lang)],
        [t('f.start'), t5(m.Mulai)], [t('f.end'), t5(m.Selesai)], [t('f.room'), m.Ruangan],
        [t('f.actualStart'), fmtActual(m['Mulai Aktual'], m.Tanggal, lang)], [t('f.actualEnd'), fmtActual(m['Selesai Aktual'], m.Tanggal, lang)],
        [t('col.status'), t('status.' + m.Status)], [t('det.attSummary'), t('det.attended', { a: attended, b: parts.length, p: pct })],
      ];
      const head = [t('col.name'), t('col.dept'), t('col.pos'), t('col.taps'), t('col.attendance')];
      const rows = parts.map((p) => {
        const taps = p['Jumlah Tap'] || 0;
        return [p['Nama Peserta'], emp(p['Nama Peserta']).Departemen || '-', emp(p['Nama Peserta']).Jabatan || '-', taps, p.Hadir ? t('det.attendedBadge') : t('det.absent')];
      });
      const ws = XLSX.utils.aoa_to_sheet([...info, [], head, ...rows]);
      ws['!cols'] = [{ wch: 30 }, { wch: 24 }, { wch: 24 }, { wch: 12 }, { wch: 18 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, t('edit.participants'));
      XLSX.writeFile(wb, `${id.replace(/[\\/:*?"<>|]/g, '-')}.xlsx`); // "/" isn't allowed in file names
    } catch (err) { notify(err.message); }
  }

  async function remove() {
    if (!window.confirm(t('msg.confirmDelete', { id }))) return;
    // remove the meeting's stored files first (table rows are removed by the cascade)
    const fl = await supabase.from('meeting_attachment').select('"File Path"').eq('Meeting ID', id);
    if (fl.error) return notify(fl.error.message);
    if (fl.data.length) {
      const rm = await supabase.storage.from(ATT_BUCKET).remove(fl.data.map((x) => x['File Path']));
      if (rm.error) return notify(rm.error.message);
      if (rm.data.length !== fl.data.length) return notify(t('err.blockedDelete'));
    }
    const a = await supabase.from('participant').delete().eq('Meeting ID', id);
    if (a.error) return notify(a.error.message);
    const { data, error } = await supabase.from('meeting').delete().eq('Meeting ID', id).select();
    if (error) return notify(error.message);
    if (!data.length) return notify(t('err.blockedDelete'));
    notify(t('msg.deleted'), true);
    await onDeleted();
  }

  return (
    <section className="p-4 sm:p-6 md:p-8 max-w-5xl w-full mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <button onClick={onBack} className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center space-x-1">
          <ArrowLeft className="w-4 h-4" /><span>{backLabel || t('det.back')}</span>
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={openEdit} className={`${actBtn} bg-white border-slate-200 text-slate-700 hover:bg-slate-50`}><Edit3 className="w-3.5 h-3.5" /><span>{t('det.edit')}</span></button>
          <button onClick={() => { setStatus(m.Status); setModal('status'); }} className={`${actBtn} bg-white border-slate-200 text-slate-700 hover:bg-slate-50`}><RefreshCw className="w-3.5 h-3.5" /><span>{t('det.changeStatus')}</span></button>
          <button onClick={remove} className={`${actBtn} bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100`}><Trash2 className="w-3.5 h-3.5" /><span>{t('det.delete')}</span></button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">{id}</span>
            <Badge status={m.Status} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">{m['Nama Meeting']}</h1>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          {[[t('f.date'), fmtDate(m.Tanggal, lang)], [t('f.start'), t5(m.Mulai)], [t('f.end'), t5(m.Selesai)], [t('f.room'), m.Ruangan],
            [t('f.actualStart'), fmtActual(m['Mulai Aktual'], m.Tanggal, lang)], [t('f.actualEnd'), fmtActual(m['Selesai Aktual'], m.Tanggal, lang)]].map(([k, v]) => (
            <div key={k} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 uppercase font-semibold text-[10px]">{k}</span>
              <p className="text-slate-800 font-semibold mt-1 text-sm">{v}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{t('det.attSummary')}</h3>
            <p className="text-xs text-slate-500">{t('det.attSub')}</p>
          </div>
          <span className="text-sm font-bold text-fuboru-red">{t('det.attended', { a: attended, b: parts.length, p: pct })}</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden border border-slate-200">
          <div className="bg-fuboru-red h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <span className="font-semibold text-sm text-slate-800">{t('det.tapLog')}</span>
          <button onClick={exportExcel} disabled={parts.length === 0}
            className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 flex items-center space-x-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /><span>{t('det.export')}</span>
          </button>
        </div>
        <div className="hidden md:block overflow-x-auto"><table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-medium text-xs border-b border-slate-100">
            <tr><th className="px-6 py-3">{t('col.name')}</th><th className="px-6 py-3">{t('col.dept')}</th><th className="px-6 py-3">{t('col.pos')}</th><th className="px-6 py-3 text-center">{t('col.taps')}</th><th className="px-6 py-3 text-right">{t('col.attendance')}</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {parts.length === 0 && <tr><td colSpan={5} className="px-6 py-4 text-center text-xs text-slate-400">{t('det.noParts')}</td></tr>}
            {parts.map((p) => {
              const e = employees.find((x) => x.Nama === p['Nama Peserta']) || {};
              const taps = p['Jumlah Tap'] || 0;
              return (
                <tr key={p.id}>
                  <td className="px-6 py-3.5 font-semibold text-slate-800"><button onClick={() => onOpenEmployee(p['Nama Peserta'])} className="text-left hover:text-fuboru-red hover:underline">{p['Nama Peserta']}</button></td>
                  <td className="px-6 py-3.5 text-xs text-slate-600">{e.Departemen || '-'}</td>
                  <td className="px-6 py-3.5 text-xs text-slate-600">{e.Jabatan || '-'}</td>
                  <td className={`px-6 py-3.5 text-center font-mono text-xs font-bold ${taps ? 'text-fuboru-red' : 'text-slate-400'}`}>{taps}</td>
                  <td className="px-6 py-3.5 text-right">
                    <AttendanceSelect p={p} busy={savingId === p.id} onChange={(v) => setAttendance(p, v)} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table></div>
        <ul className="md:hidden divide-y divide-slate-100">
          {parts.length === 0 && <li className="p-4 text-center text-xs text-slate-400">{t('det.noParts')}</li>}
          {parts.map((p) => {
            const e = employees.find((x) => x.Nama === p['Nama Peserta']) || {};
            const taps = p['Jumlah Tap'] || 0;
            return (
              <li key={p.id} className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <button onClick={() => onOpenEmployee(p['Nama Peserta'])} className="font-semibold text-slate-800 break-words text-left hover:text-fuboru-red hover:underline">{p['Nama Peserta']}</button>
                  <p className="text-xs text-slate-500">{e.Departemen || '-'} • {e.Jabatan || '-'}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{t('col.taps')}: <span className={`font-mono font-bold ${taps ? 'text-fuboru-red' : 'text-slate-400'}`}>{taps}</span></p>
                </div>
                <span className="shrink-0"><AttendanceSelect p={p} busy={savingId === p.id} onChange={(v) => setAttendance(p, v)} /></span>
              </li>
            );
          })}
        </ul>
      </div>

      <Attachments meetingId={id} notify={notify} />

      {modal === 'edit' && (
        <Modal title={t('edit.title')} onClose={() => setModal(null)}>
          <form onSubmit={saveEdit} className="space-y-4">
            <div><label className={lbl}>{t('f.name')}</label><input required value={form.name} onChange={set('name')} className={field} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className={lbl}>{t('f.date')}</label><input type="date" required value={form.date} onChange={set('date')} className={field} /></div>
              <div><label className={lbl}>{t('f.room')}</label>
                <select required value={form.room} onChange={set('room')} className={field}>
                  {rooms.map((r) => <option key={r['Room ID']} value={r['Nama Ruangan']}>{r['Nama Ruangan']}</option>)}
                </select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lbl}>{t('f.start')}</label><input type="time" required value={form.start} onChange={set('start')} className={field} /></div>
              <div><label className={lbl}>{t('f.end')}</label><input type="time" required value={form.end} onChange={set('end')} className={field} /></div>
            </div>
            <div><label className={lbl}>{t('edit.participants')}</label><ParticipantPicker employees={employees} selected={people} onChange={setPeople} /></div>
            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600">{t('common.cancel')}</button>
              <button type="submit" className="px-4 py-2 bg-fuboru-red text-white rounded-xl text-xs font-semibold hover:bg-fuboru-redHover">{t('edit.save')}</button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'status' && (
        <Modal title={t('stat.title')} size="max-w-sm" onClose={() => setModal(null)}>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${field} p-2.5 font-medium`}>
            {STATUSES.map((s) => <option key={s} value={s}>{t('status.' + s)}</option>)}
          </select>
          <div className="flex justify-end space-x-2 pt-2">
            <button onClick={() => setModal(null)} className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600">{t('common.cancel')}</button>
            <button onClick={saveStatus} className="px-4 py-2 bg-fuboru-red text-white rounded-xl text-xs font-semibold hover:bg-fuboru-redHover">{t('stat.update')}</button>
          </div>
        </Modal>
      )}
    </section>
  );
}
