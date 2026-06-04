import { useState, useEffect, useCallback } from 'react';
import type { Item, ShoppingEntry, Category, Unit } from '../types';
import { generateId, now, needsShopping, getStatus } from '../lib/utils';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const LS_ITEMS = 'despensa_items';
const LS_SHOPPING = 'despensa_shopping';

function loadLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveLS<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function useStore() {
  const [items, setItems] = useState<Item[]>(() => loadLS(LS_ITEMS, []));
  const [manualShopping, setManualShopping] = useState<ShoppingEntry[]>(() =>
    loadLS<ShoppingEntry[]>(LS_SHOPPING, []).filter(e => e.is_manual)
  );
  const [loading, setLoading] = useState(false);

  // Persist to localStorage on change
  useEffect(() => { saveLS(LS_ITEMS, items); }, [items]);
  useEffect(() => { saveLS(LS_SHOPPING, manualShopping); }, [manualShopping]);

  // Sync with Supabase if configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    setLoading(true);
    supabase.from('items').select('*').order('name').then(({ data }) => {
      if (data) setItems(data as Item[]);
      setLoading(false);
    });
    const channel = supabase.channel('items').on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'items' },
      () => {
        supabase!.from('items').select('*').order('name').then(({ data }) => {
          if (data) setItems(data as Item[]);
        });
      }
    ).subscribe();
    return () => { supabase!.removeChannel(channel); };
  }, []);

  // --- Items CRUD ---

  const addItem = useCallback(async (data: {
    name: string; category: Category; unit: Unit;
    quantity: number; min_quantity: number; notes?: string;
  }) => {
    const item: Item = {
      id: generateId(), created_at: now(), updated_at: now(),
      is_favorite: false, is_hidden: false, ...data,
    };
    if (isSupabaseConfigured && supabase) {
      const { data: row } = await supabase.from('items').insert(item).select().single();
      if (row) { setItems(prev => [...prev, row as Item].sort((a, b) => a.name.localeCompare(b.name))); return; }
    }
    setItems(prev => [...prev, item].sort((a, b) => a.name.localeCompare(b.name)));
  }, []);

  const updateItem = useCallback(async (id: string, patch: Partial<Item>) => {
    const updated = { ...patch, updated_at: now() };
    if (isSupabaseConfigured && supabase) {
      await supabase.from('items').update(updated).eq('id', id);
    }
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updated } : i));
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('items').delete().eq('id', id);
    }
    setItems(prev => prev.filter(i => i.id !== id));
    setManualShopping(prev => prev.filter(e => e.item_id !== id));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    updateItem(id, { is_favorite: !item.is_favorite });
  }, [items, updateItem]);

  const toggleHidden = useCallback((id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    updateItem(id, { is_hidden: !item.is_hidden });
  }, [items, updateItem]);

  const adjustQuantity = useCallback((id: string, delta: number) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const qty = Math.max(0, Number((item.quantity + delta).toFixed(3)));
    updateItem(id, { quantity: qty });
  }, [items, updateItem]);

  // --- Shopping list ---

  // Auto entries from inventory
  const autoShopping: ShoppingEntry[] = items
    .filter(needsShopping)
    .map(item => ({
      id: `auto_${item.id}`,
      item_id: item.id,
      name: item.name,
      category: item.category,
      unit: item.unit,
      quantity_needed: Math.max(0, item.min_quantity - item.quantity),
      is_checked: false,
      is_manual: false,
    }));

  const shoppingList: ShoppingEntry[] = [
    ...autoShopping,
    ...manualShopping,
  ];

  const addManualShoppingItem = useCallback((data: {
    name: string; category: Category; unit: string; quantity_needed: number; notes?: string;
  }) => {
    const entry: ShoppingEntry = {
      id: generateId(), is_manual: true, is_checked: false, ...data,
    };
    setManualShopping(prev => [...prev, entry]);
  }, []);

  const toggleShoppingCheck = useCallback((id: string) => {
    setManualShopping(prev => prev.map(e => e.id === id ? { ...e, is_checked: !e.is_checked } : e));
    // Auto items: track checked state separately
    setCheckedAuto(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }, []);

  const [checkedAuto, setCheckedAuto] = useState<Set<string>>(new Set());

  const deleteShoppingItem = useCallback((id: string) => {
    setManualShopping(prev => prev.filter(e => e.id !== id));
  }, []);

  const clearCheckedShopping = useCallback(() => {
    setManualShopping(prev => prev.filter(e => !e.is_checked));
    setCheckedAuto(new Set());
  }, []);

  // Merge checked state into shopping list
  const shoppingListWithChecked = shoppingList.map(e =>
    e.is_manual ? e : { ...e, is_checked: checkedAuto.has(e.id) }
  );

  return {
    items,
    loading,
    addItem,
    updateItem,
    deleteItem,
    toggleFavorite,
    toggleHidden,
    adjustQuantity,
    shoppingList: shoppingListWithChecked,
    addManualShoppingItem,
    toggleShoppingCheck,
    deleteShoppingItem,
    clearCheckedShopping,
    getItemStatus: (item: Item) => getStatus(item),
  };
}
