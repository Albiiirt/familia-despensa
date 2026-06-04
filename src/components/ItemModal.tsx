import { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import type { Item, Category, Unit } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { CATEGORIES, UNITS } from '../lib/constants';

interface Props {
  item?: Item | null;
  onSave: (data: {
    name: string; category: Category; unit: Unit;
    quantity: number; min_quantity: number; notes?: string;
  }) => void;
  onClose: () => void;
}

const DEFAULT: { name: string; category: Category; unit: Unit; quantity: string; min_quantity: string; notes: string } = {
  name: '', category: 'despensa', unit: 'und', quantity: '0', min_quantity: '1', notes: '',
};

export function ItemModal({ item, onSave, onClose }: Props) {
  const [form, setForm] = useState(DEFAULT);

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name, category: item.category, unit: item.unit,
        quantity: String(item.quantity), min_quantity: String(item.min_quantity),
        notes: item.notes ?? '',
      });
    } else {
      setForm(DEFAULT);
    }
  }, [item]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({
      name: form.name.trim(),
      category: form.category as Category,
      unit: form.unit as Unit,
      quantity: Math.max(0, parseFloat(form.quantity) || 0),
      min_quantity: Math.max(0.01, parseFloat(form.min_quantity) || 1),
      notes: form.notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl shadow-2xl z-10 overflow-hidden">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 pb-3">
          <h2 className="font-bold text-slate-800 text-lg">{item ? 'Editar producte' : 'Afegir producte'}</h2>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 pb-6 space-y-4 overflow-y-auto max-h-[75vh] hide-scrollbar">
          {/* Nom */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Nom</label>
            <input
              autoFocus
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Ex: Llet, Tomàquets..."
              required
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Categoria</label>
            <div className="grid grid-cols-4 gap-1.5">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => set('category', cat.id)}
                  className={`flex flex-col items-center gap-1 py-2 rounded-xl border transition text-xs font-medium ${
                    form.category === cat.id
                      ? 'border-2 bg-slate-50'
                      : 'border-slate-100 text-slate-500 hover:border-slate-300'
                  }`}
                  style={form.category === cat.id ? { borderColor: cat.color, color: cat.color } : {}}
                >
                  <CategoryIcon category={cat.id} size={18} />
                  <span className="leading-tight text-center w-full truncate px-0.5" style={{ fontSize: 9 }}>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Unitat */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Unitat</label>
            <div className="relative">
              <select
                value={form.unit}
                onChange={e => set('unit', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 pr-9 text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 appearance-none transition bg-white"
              >
                {UNITS.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Quantitat + Mínim */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Quantitat actual</label>
              <input
                type="number" min={0} step="any" value={form.quantity}
                onChange={e => set('quantity', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Mínim desitjat</label>
              <input
                type="number" min={0.01} step="any" value={form.min_quantity}
                onChange={e => set('min_quantity', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Notes (opcional)</label>
            <input
              type="text" value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Marca preferida, on comprar..."
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-semibold rounded-xl py-3 text-sm transition shadow-sm"
          >
            {item ? 'Desar canvis' : 'Afegir producte'}
          </button>
        </form>
      </div>
    </div>
  );
}
