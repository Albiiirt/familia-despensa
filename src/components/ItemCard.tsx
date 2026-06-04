import { useState } from 'react';
import { Minus, Plus, Star, MoreVertical, Pencil, Trash2, EyeOff, Eye } from 'lucide-react';
import type { Item } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { StatusBadge } from './StatusBadge';
import { getStatus, formatQuantity } from '../lib/utils';
import { CATEGORIES } from '../lib/constants';

interface Props {
  item: Item;
  onAdjust: (id: string, delta: number) => void;
  onToggleFavorite: (id: string) => void;
  onToggleHidden: (id: string) => void;
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
}

export function ItemCard({ item, onAdjust, onToggleFavorite, onToggleHidden, onEdit, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const status = getStatus(item);
  const catColor = CATEGORIES.find(c => c.id === item.category)?.color ?? '#94a3b8';
  const maxRef = Math.max(item.max_quantity ?? item.quantity, item.min_quantity, 0.001);
  const progress = Math.min(100, (item.quantity / maxRef) * 100);

  const stepFor = (unit: string) => {
    if (unit === 'kg' || unit === 'L') return 0.1;
    if (unit === 'g' || unit === 'ml') return 50;
    return 1;
  };
  const step = stepFor(item.unit);
  const hidden = item.is_hidden ?? false;

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-4 relative transition ${hidden ? 'opacity-50' : ''}`}>
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: catColor }} />

      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: catColor + '18' }}>
          <CategoryIcon category={item.category} size={22} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 justify-between">
            <span className="font-semibold text-slate-800 text-sm truncate">{item.name}</span>
            <div className="flex items-center gap-1 flex-shrink-0">
              {!hidden && (
                <button
                  onClick={() => onToggleFavorite(item.id)}
                  className="p-1 rounded-lg text-slate-300 hover:text-amber-400 transition-colors"
                >
                  <Star size={15} fill={item.is_favorite ? '#fbbf24' : 'none'} color={item.is_favorite ? '#fbbf24' : '#cbd5e1'} />
                </button>
              )}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(v => !v)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <MoreVertical size={15} />
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-7 z-20 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden min-w-[140px]">
                      {!hidden && (
                        <button
                          onClick={() => { setMenuOpen(false); onEdit(item); }}
                          className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Pencil size={14} /> Editar
                        </button>
                      )}
                      <button
                        onClick={() => { setMenuOpen(false); onToggleHidden(item.id); }}
                        className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-50 transition-colors"
                      >
                        {hidden ? <Eye size={14} /> : <EyeOff size={14} />}
                        {hidden ? 'Mostrar' : 'Ocultar'}
                      </button>
                      <button
                        onClick={() => { setMenuOpen(false); onDelete(item.id); }}
                        className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} /> Eliminar
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {!hidden && (
            <>
              <div className="mt-0.5 mb-2">
                <StatusBadge status={status} />
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full mb-2">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                    background: progress >= 100 ? '#22c55e' : progress >= 40 ? '#f59e0b' : '#ef4444',
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {formatQuantity(item.quantity, item.unit)}
                  <span className="text-slate-300 mx-1">/</span>
                  <span className="text-slate-400">mín {formatQuantity(item.min_quantity, item.unit)}</span>
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onAdjust(item.id, -step)}
                    className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 active:scale-95 transition"
                  >
                    <Minus size={13} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() => onAdjust(item.id, step)}
                    className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white hover:bg-emerald-600 active:scale-95 transition"
                  >
                    <Plus size={13} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </>
          )}

          {hidden && (
            <p className="text-xs text-slate-400 mt-1">Producte ocult</p>
          )}
        </div>
      </div>
    </div>
  );
}
