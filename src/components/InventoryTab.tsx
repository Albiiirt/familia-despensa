import { useState, useMemo } from 'react';
import { Plus, SlidersHorizontal, PackageOpen, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import type { Item, FilterState, ItemStatus } from '../types';
import { SearchBar } from './SearchBar';
import { ItemCard } from './ItemCard';
import { FilterPanel } from './FilterPanel';
import { ItemModal } from './ItemModal';
import { getStatus } from '../lib/utils';
import { CATEGORIES } from '../lib/constants';

interface Props {
  items: Item[];
  onAdd: (data: Parameters<React.ComponentProps<typeof ItemModal>['onSave']>[0]) => void;
  onUpdate: (id: string, patch: Partial<Item>) => void;
  onDelete: (id: string) => void;
  onAdjust: (id: string, delta: number) => void;
  onToggleFavorite: (id: string) => void;
  onToggleHidden: (id: string) => void;
}

const STATUS_ORDER: Record<ItemStatus, number> = { empty: 0, critical: 1, low: 2, ok: 3 };
const DEFAULT_FILTERS: FilterState = { categories: [], statuses: [], sortBy: 'name', onlyFavorites: false };

export function InventoryTab({ items, onAdd, onUpdate, onDelete, onAdjust, onToggleFavorite, onToggleHidden }: Props) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [showHidden, setShowHidden] = useState(false);

  const visibleItems = useMemo(() => items.filter(i => !(i.is_hidden ?? false)), [items]);
  const hiddenItems  = useMemo(() => items.filter(i => i.is_hidden ?? false),  [items]);

  const filtered = useMemo(() => {
    let list = visibleItems;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(i => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
    }
    if (filters.categories.length) list = list.filter(i => filters.categories.includes(i.category));
    if (filters.statuses.length)   list = list.filter(i => filters.statuses.includes(getStatus(i)));
    if (filters.onlyFavorites)     list = list.filter(i => i.is_favorite);
    return [...list].sort((a, b) => {
      if (filters.sortBy === 'status') return STATUS_ORDER[getStatus(a)] - STATUS_ORDER[getStatus(b)];
      if (filters.sortBy === 'category') return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
      return a.name.localeCompare(b.name);
    });
  }, [visibleItems, search, filters]);

  const activeFilters = filters.categories.length + filters.statuses.length + (filters.onlyFavorites ? 1 : 0);

  const grouped = useMemo(() => {
    if (filters.sortBy !== 'category') return null;
    const groups: Record<string, Item[]> = {};
    for (const item of filtered) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    }
    return groups;
  }, [filtered, filters.sortBy]);

  const renderCard = (item: Item) => (
    <ItemCard
      key={item.id} item={item}
      onAdjust={onAdjust}
      onToggleFavorite={onToggleFavorite}
      onToggleHidden={onToggleHidden}
      onEdit={i => { setEditItem(i); setModalOpen(true); }}
      onDelete={onDelete}
    />
  );

  return (
    <div className="flex flex-col h-full">
      {/* search + filter bar */}
      <div className="px-4 pt-3 pb-2 flex gap-2">
        <div className="flex-1 min-w-0">
          <SearchBar value={search} onChange={setSearch} placeholder="Cercar producte..." />
        </div>
        <button
          onClick={() => setFilterOpen(true)}
          className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border transition ${
            activeFilters > 0
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
          }`}
        >
          <SlidersHorizontal size={17} />
          {activeFilters > 0 && (
            <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white text-emerald-600 text-[9px] font-bold flex items-center justify-center leading-none">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {/* category chips */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto hide-scrollbar">
        {CATEGORIES.map(cat => {
          const count = visibleItems.filter(i => i.category === cat.id).length;
          if (!count) return null;
          return (
            <button
              key={cat.id}
              onClick={() => setFilters(f => ({
                ...f,
                categories: f.categories.includes(cat.id)
                  ? f.categories.filter(c => c !== cat.id)
                  : [...f.categories, cat.id]
              }))}
              className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition"
              style={filters.categories.includes(cat.id)
                ? { background: cat.color, color: '#fff', borderColor: cat.color }
                : { background: cat.color + '15', color: cat.color, borderColor: cat.color + '40' }
              }
            >
              {cat.label} {count}
            </button>
          );
        })}
      </div>

      {/* list */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-24">
        {filtered.length === 0 && hiddenItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <PackageOpen size={48} strokeWidth={1.5} className="mb-3 text-slate-300" />
            <p className="text-sm font-medium">{visibleItems.length === 0 ? 'El teu rebost és buit' : 'Cap resultat'}</p>
            <p className="text-xs mt-1">{visibleItems.length === 0 ? 'Prem + per afegir productes' : 'Prova amb altres filtres'}</p>
          </div>
        ) : (
          <>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <p className="text-sm">Cap resultat</p>
                <p className="text-xs mt-1">Prova amb altres filtres</p>
              </div>
            ) : grouped ? (
              Object.entries(grouped).map(([cat, catItems]) => {
                const catInfo = CATEGORIES.find(c => c.id === cat);
                return (
                  <div key={cat} className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-px flex-1" style={{ background: (catInfo?.color ?? '#94a3b8') + '40' }} />
                      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: catInfo?.color ?? '#94a3b8' }}>
                        {catInfo?.label}
                      </span>
                      <div className="h-px flex-1" style={{ background: (catInfo?.color ?? '#94a3b8') + '40' }} />
                    </div>
                    <div className="space-y-2.5">{catItems.map(renderCard)}</div>
                  </div>
                );
              })
            ) : (
              <div className="space-y-2.5 pt-1">{filtered.map(renderCard)}</div>
            )}

            {/* Hidden items section */}
            {hiddenItems.length > 0 && (
              <div className="mt-4 mb-2">
                <button
                  onClick={() => setShowHidden(v => !v)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-500 transition"
                >
                  <EyeOff size={14} />
                  <span className="text-xs font-medium flex-1 text-left">
                    {hiddenItems.length} producte{hiddenItems.length !== 1 ? 's' : ''} ocult{hiddenItems.length !== 1 ? 's' : ''}
                  </span>
                  {showHidden ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {showHidden && (
                  <div className="space-y-2 mt-2">
                    {hiddenItems
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map(renderCard)}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => { setEditItem(null); setModalOpen(true); }}
        className="fixed bottom-24 right-4 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200 flex items-center justify-center active:scale-95 transition z-30"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      <FilterPanel
        open={filterOpen} filters={filters}
        onChange={setFilters} onClose={() => setFilterOpen(false)}
        resultCount={filtered.length}
      />

      {modalOpen && (
        <ItemModal
          item={editItem}
          onSave={data => editItem ? onUpdate(editItem.id, data) : onAdd(data)}
          onClose={() => { setModalOpen(false); setEditItem(null); }}
        />
      )}
    </div>
  );
}
