import type { Item, ItemStatus } from '../types';

export function getStatus(item: Item): ItemStatus {
  if (item.quantity <= 0) return 'empty';
  if (item.quantity < item.min_quantity * 0.4) return 'critical';
  if (item.quantity < item.min_quantity) return 'low';
  return 'ok';
}

export function formatQuantity(quantity: number, unit: string): string {
  const n = Number(quantity);
  const formatted = Number.isInteger(n) ? n.toString() : n.toFixed(2).replace(/\.?0+$/, '');
  return `${formatted} ${unit}`;
}

export function needsShopping(item: Item): boolean {
  const s = getStatus(item);
  return s === 'low' || s === 'critical' || s === 'empty';
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function now(): string {
  return new Date().toISOString();
}
