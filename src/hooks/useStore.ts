import { useState, useEffect, useCallback, useRef } from 'react';
import type { Item, ShoppingEntry, Category, Unit } from '../types';
import { generateId, now, needsShopping, getStatus } from '../lib/utils';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const LS_ITEMS    = 'despensa_items';
const LS_SHOPPING = 'despensa_shopping';

function loadLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
function saveLS<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function useStore() {
  const [items, setItems] = useState<Item[]>(() => loadLS(LS_ITEMS, []));

  // Shopping list fully synced via Supabase; fallback to localStorage
  const [dbShopping, setDbShopping] = useState<ShoppingEntry[]>(() =>
    isSupabaseConfigured ? [] : loadLS<ShoppingEntry[]>(LS_SHOPPING, [])
  );

  const [loading, setLoading] = useState(false);

  // Stable refs so callbacks always see latest data
  const itemsRef      = useRef(items);
  const dbShoppingRef = useRef(dbShopping);
  useEffect(() => { itemsRef.current = items; }, [items]);
  useEffect(() => { dbShoppingRef.current = dbShopping; }, [dbShopping]);

  // ---------- Supabase sync: items ----------
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    setLoading(true);
    supabase.from('items').select('*').order('name').then(({ data }) => {
      if (data) setItems(data as Item[]);
      setLoading(false);
    });
    const ch = supabase.channel('items').on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'items' },
      () => supabase!.from('items').select('*').order('name').then(({ data }) => {
        if (data) setItems(data as Item[]);
      })
    ).subscribe();
    return () => { supabase!.removeChannel(ch); };
  }, []);

  // ---------- Supabase sync: shopping_list ----------
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    supabase.from('shopping_list').select('*').order('created_at').then(({ data }) => {
      if (data) setDbShopping(data as ShoppingEntry[]);
    });
    const ch = supabase.channel('shopping_list').on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'shopping_list' },
      () => supabase!.from('shopping_list').select('*').order('created_at').then(({ data }) => {
        if (data) setDbShopping(data as ShoppingEntry[]);
      })
    ).subscribe();
    return () => { supabase!.removeChannel(ch); };
  }, []);

  // Persist to localStorage when Supabase not configured
  useEffect(() => { saveLS(LS_ITEMS, items); }, [items]);
  useEffect(() => {
    if (!isSupabaseConfigured) saveLS(LS_SHOPPING, dbShopping);
  }, [dbShopping]);

  // ---------- Items CRUD ----------

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
      if (row) setItems(prev => [...prev, row as Item].sort((a, b) => a.name.localeCompare(b.name)));
      return;
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
      await supabase.from('shopping_list').delete().eq('id', `auto_${id}`);
    }
    setItems(prev => prev.filter(i => i.id !== id));
    setDbShopping(prev => prev.filter(e => e.id !== `auto_${id}` && e.item_id !== id));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    const item = itemsRef.current.find(i => i.id === id);
    if (!item) return;
    updateItem(id, { is_favorite: !item.is_favorite });
  }, [updateItem]);

  const toggleHidden = useCallback((id: string) => {
    const item = itemsRef.current.find(i => i.id === id);
    if (!item) return;
    updateItem(id, { is_hidden: !item.is_hidden });
  }, [updateItem]);

  const adjustQuantity = useCallback((id: string, delta: number) => {
    const item = itemsRef.current.find(i => i.id === id);
    if (!item) return;
    const qty = Math.max(0, Number((item.quantity + delta).toFixed(3)));
    updateItem(id, { quantity: qty });
  }, [updateItem]);

  // ---------- Shopping list ----------

  // Auto entries derived from inventory
  const autoShopping: ShoppingEntry[] = items
    .filter(i => !(i.is_hidden ?? false) && needsShopping(i))
    .map(item => {
      const autoId = `auto_${item.id}`;
      const dbEntry = dbShopping.find(e => e.id === autoId);
      return {
        id: autoId,
        item_id: item.id,
        name: item.name,
        category: item.category,
        unit: item.unit,
        quantity_needed: Math.max(0, item.min_quantity - item.quantity),
        is_checked: dbEntry?.is_checked ?? false,
        is_manual: false,
      };
    });

  const manualShopping = dbShopping.filter(e => e.is_manual);
  const shoppingList: ShoppingEntry[] = [...autoShopping, ...manualShopping];

  const addManualShoppingItem = useCallback(async (data: {
    name: string; category: Category; unit: string; quantity_needed: number; notes?: string;
  }) => {
    const entry: ShoppingEntry = { id: generateId(), is_manual: true, is_checked: false, ...data };
    if (isSupabaseConfigured && supabase) {
      await supabase.from('shopping_list').insert(entry);
      return; // realtime will update state
    }
    setDbShopping(prev => [...prev, entry]);
  }, []);

  const toggleShoppingCheck = useCallback(async (id: string) => {
    const isAuto = id.startsWith('auto_');
    const db = dbShoppingRef.current;

    if (isAuto) {
      const itemId = id.replace('auto_', '');
      const srcItem = itemsRef.current.find(i => i.id === itemId);
      if (!srcItem) return;
      const existing = db.find(e => e.id === id);
      const newChecked = !(existing?.is_checked ?? false);
      const entry: ShoppingEntry = {
        id, item_id: itemId, name: srcItem.name, category: srcItem.category,
        unit: srcItem.unit, quantity_needed: Math.max(0, srcItem.min_quantity - srcItem.quantity),
        is_checked: newChecked, is_manual: false,
      };
      // Optimistic update always
      setDbShopping(prev =>
        existing
          ? prev.map(e => e.id === id ? { ...e, is_checked: newChecked } : e)
          : [...prev, entry]
      );
      if (isSupabaseConfigured && supabase) {
        supabase.from('shopping_list').upsert(entry).then();
      }
    } else {
      const existing = db.find(e => e.id === id);
      if (!existing) return;
      const newChecked = !existing.is_checked;
      // Optimistic update always
      setDbShopping(prev => prev.map(e => e.id === id ? { ...e, is_checked: newChecked } : e));
      if (isSupabaseConfigured && supabase) {
        supabase.from('shopping_list').update({ is_checked: newChecked }).eq('id', id).then();
      }
    }
  }, []);

  const deleteShoppingItem = useCallback(async (id: string) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('shopping_list').delete().eq('id', id);
      return;
    }
    setDbShopping(prev => prev.filter(e => e.id !== id));
  }, []);

  const clearCheckedShopping = useCallback(async () => {
    const checked = shoppingList.filter(e => e.is_checked);
    if (!checked.length) return;

    // Restock auto items: set quantity to min_quantity
    for (const entry of checked) {
      if (!entry.is_manual && entry.item_id) {
        const item = itemsRef.current.find(i => i.id === entry.item_id);
        if (item) updateItem(item.id, { quantity: item.min_quantity });
      }
    }

    // Remove from shopping list
    const checkedIds = checked.map(e => e.id);
    setDbShopping(prev => prev.filter(e => !checkedIds.includes(e.id)));
    if (isSupabaseConfigured && supabase) {
      supabase.from('shopping_list').delete().in('id', checkedIds).then();
    }
  }, [shoppingList, updateItem]);

  return {
    items,
    loading,
    addItem,
    updateItem,
    deleteItem,
    toggleFavorite,
    toggleHidden,
    adjustQuantity,
    shoppingList,
    addManualShoppingItem,
    toggleShoppingCheck,
    deleteShoppingItem,
    clearCheckedShopping,
    getItemStatus: (item: Item) => getStatus(item),
  };
}
