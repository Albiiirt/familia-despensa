import { X, Star, SlidersHorizontal } from 'lucide-react';
import type { FilterState, Category, ItemStatus } from '../types';
import { CATEGORIES, STATUS_CONFIG } from '../lib/constants';
import { CategoryIcon } from './CategoryIcon';

interface Props {
  open: boolean;
  filters: FilterState;
  onChange: (f: FilterState) => void;
  onClose: () => void;
  resultCount: number;
}

const STATUSES: ItemStatus[] = ['ok', 'low', 'critical', 'empty'];
const SORT_OPTIONS: { id: FilterState['sortBy']; label: string }[] = [
  { id: 'name',     label: 'Nom A-Z' },
  { id: 'status',   label: 'Estat (pitjor primer)' },
  { id: 'category', label: 'Categoria' },
];

export function FilterPanel({ open, filters, onChange, onClose, resultCount }: Props) {
  if (!open) return null;

  const toggleCategory = (cat: Category) => {
    const next = filters.categories.includes(cat)
      ? filters.categories.filter(c => c !== cat)
      : [...filters.categories, cat];
    onChange({ ...filters, categories: next });
  };

  const toggleStatus = (s: ItemStatus) => {
    const next = filters.statuses.includes(s)
      ? filters.statuses.filter(x => x !== s)
      : [...filters.statuses, s];
    onChange({ ...filters, statuses: next });
  };

  const reset = () => onChange({ categories: [], statuses: [], sortBy: 'name', onlyFavorites: false });
  const activeCount = filters.categories.length + filters.statuses.length + (filters.onlyFavorites ? 1 : 0);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl shadow-2xl z-10">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-slate-600" />
            <span className="font-bold text-slate-800">Filtres i ordre</span>
            {activeCount > 0 && (
              <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{activeCount}</span>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 pb-6 space-y-5 overflow-y-auto max-h-[70vh] hide-scrollbar">
          {/* Estat */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Estat</p>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map(s => {
                const cfg = STATUS_CONFIG[s];
                const active = filters.statuses.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleStatus(s)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition"
                    style={active ? { background: cfg.bg, color: cfg.color, borderColor: cfg.dot } : { borderColor: '#e2e8f0', color: '#64748b' }}
                  >
                    <span className="rounded-full" style={{ width: 7, height: 7, background: active ? cfg.dot : '#cbd5e1', display: 'inline-block' }} />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Categoria */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Categoria</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => {
                const active = filters.categories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition"
                    style={active ? { background: cat.color + '18', color: cat.color, borderColor: cat.color } : { borderColor: '#e2e8f0', color: '#64748b' }}
                  >
                    <CategoryIcon category={cat.id} size={13} />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Favorits */}
          <div>
            <button
              onClick={() => onChange({ ...filters, onlyFavorites: !filters.onlyFavorites })}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition ${
                filters.onlyFavorites ? 'bg-amber-50 text-amber-600 border-amber-400' : 'border-slate-200 text-slate-600'
              }`}
            >
              <Star size={14} fill={filters.onlyFavorites ? '#fbbf24' : 'none'} color={filters.onlyFavorites ? '#fbbf24' : '#94a3b8'} />
              Només favorits
            </button>
          </div>

          {/* Ordenar */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Ordenar per</p>
            <div className="flex flex-col gap-2">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => onChange({ ...filters, sortBy: opt.id })}
                  className={`text-left px-3.5 py-2.5 rounded-xl text-sm border transition ${
                    filters.sortBy === opt.id
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-medium'
                      : 'border-slate-100 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            {activeCount > 0 && (
              <button
                onClick={reset}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
              >
                Netejar filtres
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 py-2.5 text-sm font-semibold text-white transition"
            >
              Veure {resultCount} resultat{resultCount !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
