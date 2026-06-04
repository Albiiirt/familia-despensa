import { useState, useMemo } from 'react';
import { Plus, CheckSquare, Trash2, ShoppingCart, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import type { ShoppingEntry, Category } from '../types';
import { SearchBar } from './SearchBar';
import { CategoryIcon } from './CategoryIcon';
import { CATEGORIES, UNITS } from '../lib/constants';
import { formatQuantity } from '../lib/utils';

interface Props {
  shoppingList: ShoppingEntry[];
  onToggleCheck: (id: string) => void;
  onDelete: (id: string) => void;
  onAddManual: (data: { name: string; category: Category; unit: string; quantity_needed: number; notes?: string }) => void;
  onClearChecked: () => void;
}

function AddManualForm({ onAdd, onClose }: { onAdd: Props['onAddManual']; onClose: () => void }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('despensa');
  const [unit, setUnit] = useState('und');
  const [qty, setQty] = useState('1');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({ name: name.trim(), category, unit, quantity_needed: parseFloat(qty) || 1 });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl shadow-2xl z-10">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>
        <div className="flex items-center justify-between px-5 py-3">
          <h2 className="font-bold text-slate-800 text-lg">Afegir a la compra</h2>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition"><X size={20} /></button>
        </div>
        <form onSubmit={submit} className="px-5 pb-6 space-y-4">
          <input
            autoFocus type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="Què necessites?" required
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
          />
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.slice(0, 6).map(cat => (
              <button key={cat.id} type="button" onClick={() => setCategory(cat.id)}
                className="flex items-center gap-1.5 px-2 py-2 rounded-xl border text-xs transition"
                style={category === cat.id ? { borderColor: cat.color, color: cat.color, background: cat.color + '15' } : { borderColor: '#e2e8f0', color: '#64748b' }}
              >
                <CategoryIcon category={cat.id} size={13} /> {cat.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Quantitat</label>
              <input type="number" min={0.01} step="any" value={qty} onChange={e => setQty(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Unitat</label>
              <div className="relative">
                <select value={unit} onChange={e => setUnit(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 appearance-none bg-white transition"
                >
                  {UNITS.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
          <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl py-3 text-sm transition">
            Afegir
          </button>
        </form>
      </div>
    </div>
  );
}

export function ShoppingTab({ shoppingList, onToggleCheck, onDelete, onAddManual, onClearChecked }: Props) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<Category | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [showOnlyPending, setShowOnlyPending] = useState(false);

  const filtered = useMemo(() => {
    let list = shoppingList;
    if (search) { const q = search.toLowerCase(); list = list.filter(e => e.name.toLowerCase().includes(q)); }
    if (catFilter) list = list.filter(e => e.category === catFilter);
    if (showOnlyPending) list = list.filter(e => !e.is_checked);
    return list;
  }, [shoppingList, search, catFilter, showOnlyPending]);

  const pending = shoppingList.filter(e => !e.is_checked).length;
  const checked = shoppingList.filter(e => e.is_checked).length;

  const grouped = useMemo(() => {
    const g: Record<string, ShoppingEntry[]> = {};
    for (const e of filtered) {
      if (!g[e.category]) g[e.category] = [];
      g[e.category].push(e);
    }
    return g;
  }, [filtered]);

  const usedCats = useMemo(() => {
    const cats = new Set(shoppingList.map(e => e.category));
    return CATEGORIES.filter(c => cats.has(c.id));
  }, [shoppingList]);

  return (
    <div className="flex flex-col h-full">
      {/* header stats */}
      <div className="px-4 pt-3 pb-2 space-y-2">
        <div className="bg-white rounded-2xl p-3 border border-slate-100 flex items-center gap-2">
          <ShoppingCart size={18} className="text-emerald-500 flex-shrink-0" />
          <span className="text-sm font-semibold text-slate-700">
            {pending} pendent{pending !== 1 ? 's' : ''}
          </span>
          {checked > 0 && (
            <span className="text-xs text-slate-400">· {checked} marcat{checked !== 1 ? 's' : ''}</span>
          )}
        </div>
        {checked > 0 && (
          <button
            onClick={onClearChecked}
            className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-500 font-semibold rounded-2xl py-2.5 text-sm border border-red-100 transition"
          >
            <Trash2 size={15} />
            Eliminar marcats ({checked})
          </button>
        )}
      </div>

      {/* search + filters */}
      <div className="px-4 pb-2 flex gap-2">
        <div className="flex-1 min-w-0">
          <SearchBar value={search} onChange={setSearch} placeholder="Cercar a la llista..." />
        </div>
        <button
          onClick={() => setShowOnlyPending(v => !v)}
          className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border transition ${
            showOnlyPending ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-500'
          }`}
          title="Només pendents"
        >
          <SlidersHorizontal size={17} />
        </button>
      </div>

      {/* category chips */}
      {usedCats.length > 1 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setCatFilter(null)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition ${
              !catFilter ? 'bg-slate-700 text-white border-slate-700' : 'border-slate-200 text-slate-500 bg-white'
            }`}
          >
            Totes
          </button>
          {usedCats.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCatFilter(f => f === cat.id ? null : cat.id)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition"
              style={catFilter === cat.id
                ? { background: cat.color, color: '#fff', borderColor: cat.color }
                : { background: cat.color + '15', color: cat.color, borderColor: cat.color + '40' }
              }
            >
              <CategoryIcon category={cat.id} size={11} />
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* list */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-24">
        {shoppingList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <CheckSquare size={48} strokeWidth={1.5} className="mb-3 text-slate-300" />
            <p className="text-sm font-medium">Llista de la compra buida</p>
            <p className="text-xs mt-1">Quan alguna cosa s'acabi apareixerà aquí</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <p className="text-sm">Cap resultat</p>
          </div>
        ) : (
          Object.entries(grouped).map(([cat, entries]) => {
            const catInfo = CATEGORIES.find(c => c.id === cat);
            return (
              <div key={cat} className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-px flex-1" style={{ background: (catInfo?.color ?? '#94a3b8') + '40' }} />
                  <div className="flex items-center gap-1.5">
                    <CategoryIcon category={cat as Category} size={12} />
                    <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: catInfo?.color ?? '#94a3b8' }}>
                      {catInfo?.label}
                    </span>
                  </div>
                  <div className="h-px flex-1" style={{ background: (catInfo?.color ?? '#94a3b8') + '40' }} />
                </div>
                <div className="space-y-2">
                  {entries.map(entry => (
                    <div
                      key={entry.id}
                      className={`bg-white rounded-xl border p-3 flex items-center gap-3 transition ${
                        entry.is_checked ? 'opacity-60 border-slate-100' : 'border-slate-100'
                      }`}
                    >
                      <button
                        onClick={() => onToggleCheck(entry.id)}
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                          entry.is_checked ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'
                        }`}
                      >
                        {entry.is_checked && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium text-slate-800 truncate ${entry.is_checked ? 'line-through text-slate-400' : ''}`}>
                          {entry.name}
                        </p>
                        {entry.quantity_needed > 0 && (
                          <p className="text-xs text-slate-400 mt-0.5">{formatQuantity(entry.quantity_needed, entry.unit)}</p>
                        )}
                      </div>
                      {entry.is_manual && (
                        <button
                          onClick={() => onDelete(entry.id)}
                          className="flex-shrink-0 p-1.5 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      {!entry.is_manual && (
                        <span className="flex-shrink-0 text-xs text-slate-300 px-1">auto</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowManual(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200 flex items-center justify-center active:scale-95 transition z-30"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      {showManual && <AddManualForm onAdd={onAddManual} onClose={() => setShowManual(false)} />}
    </div>
  );
}
