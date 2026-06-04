export type Unit = 'kg' | 'g' | 'L' | 'ml' | 'und' | 'pack' | 'docena' | 'bote';

export type Category =
  | 'frutas'
  | 'verduras'
  | 'lacteos'
  | 'carne'
  | 'pescado'
  | 'despensa'
  | 'bebidas'
  | 'congelados'
  | 'panaderia'
  | 'limpieza'
  | 'higiene'
  | 'otros';

export type ItemStatus = 'ok' | 'low' | 'critical' | 'empty';

export interface Item {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  category: Category;
  unit: Unit;
  quantity: number;
  min_quantity: number;
  notes?: string;
  is_favorite: boolean;
}

export interface ShoppingEntry {
  id: string;
  item_id?: string;
  name: string;
  category: Category;
  unit: string;
  quantity_needed: number;
  is_checked: boolean;
  is_manual: boolean;
  notes?: string;
}

export type TabId = 'despensa' | 'compra';

export interface FilterState {
  categories: Category[];
  statuses: ItemStatus[];
  sortBy: 'name' | 'category' | 'status';
  onlyFavorites: boolean;
}
