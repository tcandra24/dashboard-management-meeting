'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Download, Paperclip, Trash2, Upload } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { ATT_BUCKET, ATT_MAX, fmtDate, fmtSize } from '../lib/helpers';
import { useLang } from './LanguageProvider';
import { useAutoRefresh } from '../lib/useAutoRefresh';

export default function Attachments({ meetingId, notify }) {
  const { t, lang } = useLang();
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const input = useRef(null);

  const load = useCallback(async (silent = false) => {
    const { data, error } = await supabase.from('meeting_attachment').select('*').eq('Meeting ID', meetingId);
    if (error) return silent || notify(error.message);
    setFiles((data || []).sort((a, b) => b['Uploaded At'].localeCompare(a['Uploaded At'])));
  }, [meetingId, notify]);
  useEffect(() => { load(); }, [load]);
  useAutoRefresh(['meeting_attachment'], () => load(true));

  async function upload(list) {
    const picked = Array.from(list || []);
    if (!picked.length) return;
    setBusy(true);
    let ok = 0;
    for (const f of picked) {
      if (f.size > ATT_MAX) { notify(t('att.tooLarge', { name: f.name })); continue; }
      // random storage key; the original name is kept in the table
      const ext = f.name.includes('.') ? f.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10) : '';
      const path = crypto.randomUUID() + (ext ? '.' + ext : '');
      const up = await supabase.storage.from(ATT_BUCKET).upload(path, f, { contentType: f.type || undefined });
      if (up.error) { notify(t('att.failed', { name: f.name, err: up.error.message })); continue; }
      const ins = await supabase.from('meeting_attachment')
        .insert({ 'Meeting ID': meetingId, 'File Name': f.name, 'File Path': path, 'File Size': f.size, 'File Type': f.type || null });
      if (ins.error) {
        await supabase.storage.from(ATT_BUCKET).remove([path]); // don't leave an orphan file
        notify(t('att.failed', { name: f.name, err: ins.error.message }));
        continue;
      }
      ok++;
    }
    setBusy(false);
    if (input.current) input.current.value = '';
    if (ok) notify(t('att.uploaded', { n: ok }), true);
    await load();
  }

  async function download(f) {
    const { data, error } = await supabase.storage.from(ATT_BUCKET).createSignedUrl(f['File Path'], 60, { download: f['File Name'] });
    if (error) return notify(error.message);
    const a = document.createElement('a');
    a.href = data.signedUrl;
    a.click();
  }

  async function removeFile(f) {
    if (!window.confirm(t('att.confirmDelete', { name: f['File Name'] }))) return;
    const { data, error } = await supabase.storage.from(ATT_BUCKET).remove([f['File Path']]);
    if (error) return notify(error.message);
    if (!data.length) return notify(t('err.blockedDelete'));
    const r = await supabase.from('meeting_attachment').delete().eq('id', f.id);
    if (r.error) return notify(r.error.message);
    notify(t('att.deleted'), true);
    await load();
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-1">
        <span className="font-semibold text-sm text-slate-800 flex items-center space-x-2"><Paperclip className="w-4 h-4" /><span>{t('att.title')}</span></span>
        <span className="text-[11px] text-slate-400 font-medium">{t('att.sub')}</span>
      </div>
      <div className="p-4 space-y-3">
        <label onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); upload(e.dataTransfer.files); }}
          className={`flex flex-col items-center justify-center gap-1 py-6 rounded-xl border-2 border-dashed cursor-pointer text-xs font-medium transition ${over ? 'border-fuboru-red bg-red-50 text-fuboru-red' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
          <Upload className="w-5 h-5" />
          <span>{busy ? t('att.uploading') : t('att.drop')}</span>
          <input ref={input} type="file" multiple disabled={busy} className="hidden" onChange={(e) => upload(e.target.files)} />
        </label>

        {files.length === 0 && <p className="text-xs text-slate-400 text-center py-1">{t('att.empty')}</p>}
        <ul className="divide-y divide-slate-100">
          {files.map((f) => (
            <li key={f.id} className="flex items-center justify-between py-2.5 gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{f['File Name']}</p>
                <p className="text-[11px] text-slate-400">{fmtSize(f['File Size'])} • {fmtDate(f['Uploaded At'].slice(0, 10), lang)}</p>
              </div>
              <div className="flex items-center space-x-1 shrink-0">
                <button onClick={() => download(f)} title={t('att.download')} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"><Download className="w-4 h-4" /></button>
                <button onClick={() => removeFile(f)} title={t('det.delete')} className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
