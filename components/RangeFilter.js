'use client';
import { useLang } from './LanguageProvider';

// value = { mode: 'month' | 'custom' | 'all', from, to }
export default function RangeFilter({ value, onChange, allowAll = false }) {
  const { t } = useLang();
  const tab = (on) => `px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${on ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`;
  const modes = [['month', 'dash.thisMonth'], ['custom', 'dash.custom'], ...(allowAll ? [['all', 'emp.allTime']] : [])];
  const set = (patch) => onChange({ ...value, ...patch });
  const date = 'px-2 py-1 border border-slate-200 rounded-lg text-xs focus:outline-none';
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        {modes.map(([m, key]) => <button key={m} onClick={() => set({ mode: m })} className={tab(value.mode === m)}>{t(key)}</button>)}
      </div>
      {value.mode === 'custom' && (
        <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-xl p-1 text-xs shadow-sm">
          <input type="date" value={value.from} max={value.to || undefined} onChange={(e) => set({ from: e.target.value })} className={date} />
          <span className="text-slate-400">{t('common.to')}</span>
          <input type="date" value={value.to} min={value.from || undefined} onChange={(e) => set({ to: e.target.value })} className={date} />
        </div>
      )}
    </div>
  );
}
