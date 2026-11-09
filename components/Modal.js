import { X } from 'lucide-react';

export default function Modal({ title, onClose, size = 'max-w-lg', children }) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-2xl ${size} w-full p-5 sm:p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
