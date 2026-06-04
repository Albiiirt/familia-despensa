import type { Category, Unit } from '../types';

export const CATEGORIES: { id: Category; label: string; color: string }[] = [
  { id: 'frutas',     label: 'Frutas',     color: '#f97316' },
  { id: 'verduras',   label: 'Verduras',   color: '#22c55e' },
  { id: 'lacteos',    label: 'Lácteos',    color: '#60a5fa' },
  { id: 'carne',      label: 'Carne',      color: '#ef4444' },
  { id: 'pescado',    label: 'Pescado',    color: '#06b6d4' },
  { id: 'despensa',   label: 'Despensa',   color: '#a78bfa' },
  { id: 'bebidas',    label: 'Bebidas',    color: '#3b82f6' },
  { id: 'congelados', label: 'Congelados', color: '#818cf8' },
  { id: 'panaderia',  label: 'Panadería',  color: '#d97706' },
  { id: 'limpieza',   label: 'Limpieza',   color: '#14b8a6' },
  { id: 'higiene',    label: 'Higiene',    color: '#ec4899' },
  { id: 'otros',      label: 'Otros',      color: '#94a3b8' },
];

export const UNITS: { id: Unit; label: string }[] = [
  { id: 'und',    label: 'unidades' },
  { id: 'kg',     label: 'kg' },
  { id: 'g',      label: 'g' },
  { id: 'L',      label: 'litros' },
  { id: 'ml',     label: 'ml' },
  { id: 'pack',   label: 'pack' },
  { id: 'docena', label: 'docena' },
  { id: 'bote',   label: 'bote' },
];

export const STATUS_CONFIG = {
  ok:       { label: 'Bien',        color: '#22c55e', bg: '#f0fdf4', dot: '#22c55e' },
  low:      { label: 'Queda poco',  color: '#f59e0b', bg: '#fffbeb', dot: '#f59e0b' },
  critical: { label: 'Casi vacío',  color: '#f97316', bg: '#fff7ed', dot: '#f97316' },
  empty:    { label: 'Sin stock',   color: '#ef4444', bg: '#fef2f2', dot: '#ef4444' },
};
