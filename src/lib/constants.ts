import type { Category, Unit } from '../types';

export const CATEGORIES: { id: Category; label: string; color: string }[] = [
  { id: 'frutas',     label: 'Fruites',    color: '#f97316' },
  { id: 'verduras',   label: 'Verdures',   color: '#22c55e' },
  { id: 'lacteos',    label: 'Làctics',    color: '#60a5fa' },
  { id: 'carne',      label: 'Carn',       color: '#ef4444' },
  { id: 'pescado',    label: 'Peix',       color: '#06b6d4' },
  { id: 'despensa',   label: 'Rebost',     color: '#a78bfa' },
  { id: 'bebidas',    label: 'Begudes',    color: '#3b82f6' },
  { id: 'congelados', label: 'Congelats',  color: '#818cf8' },
  { id: 'panaderia',  label: 'Fleca',      color: '#d97706' },
  { id: 'limpieza',   label: 'Neteja',     color: '#14b8a6' },
  { id: 'higiene',    label: 'Higiene',    color: '#ec4899' },
  { id: 'otros',      label: 'Altres',     color: '#94a3b8' },
];

export const UNITS: { id: Unit; label: string }[] = [
  { id: 'und',    label: 'unitats' },
  { id: 'kg',     label: 'kg' },
  { id: 'g',      label: 'g' },
  { id: 'L',      label: 'litres' },
  { id: 'ml',     label: 'ml' },
  { id: 'pack',   label: 'pack' },
  { id: 'docena', label: 'dotzena' },
  { id: 'bote',   label: 'pot' },
];

export const STATUS_CONFIG = {
  ok:       { label: 'Bé',             color: '#22c55e', bg: '#f0fdf4', dot: '#22c55e' },
  low:      { label: "En queda poc",   color: '#f59e0b', bg: '#fffbeb', dot: '#f59e0b' },
  critical: { label: 'Quasi buit',     color: '#f97316', bg: '#fff7ed', dot: '#f97316' },
  empty:    { label: 'Sense estoc',    color: '#ef4444', bg: '#fef2f2', dot: '#ef4444' },
};
