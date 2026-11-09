import { useLang } from './LanguageProvider';

const STYLE = {
  Planned: 'bg-blue-50 text-blue-700 border-blue-200',
  Ongoing: 'bg-amber-50 text-amber-700 border-amber-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Canceled: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function Badge({ status }) {
  const { t } = useLang();
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STYLE[status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
      {t('status.' + status)}
    </span>
  );
}
