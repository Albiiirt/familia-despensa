import {
  Apple, Leaf, Milk, Beef, Fish, Package, GlassWater,
  Snowflake, Wheat, Sparkles, Heart, HelpCircle, ShoppingBag,
} from 'lucide-react';
import type { Category } from '../types';
import { CATEGORIES } from '../lib/constants';

const ICONS: Record<Category, React.ElementType> = {
  frutas:     Apple,
  verduras:   Leaf,
  lacteos:    Milk,
  carne:      Beef,
  pescado:    Fish,
  despensa:   Package,
  bebidas:    GlassWater,
  congelados: Snowflake,
  panaderia:  Wheat,
  limpieza:   Sparkles,
  higiene:    Heart,
  otros:      HelpCircle,
};

interface Props {
  category: Category;
  size?: number;
  className?: string;
}

export function CategoryIcon({ category, size = 20, className }: Props) {
  const Icon = ICONS[category] ?? ShoppingBag;
  const color = CATEGORIES.find(c => c.id === category)?.color ?? '#94a3b8';
  return <Icon size={size} color={color} className={className} strokeWidth={2} />;
}
