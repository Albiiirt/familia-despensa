import { useState, useMemo } from 'react';
import { ShoppingCart, Package, AlertCircle, LogOut } from 'lucide-react';
import type { TabId } from './types';
import { useStore } from './hooks/useStore';
import { usePasswordAuth } from './hooks/usePasswordAuth';
import { InventoryTab } from './components/InventoryTab';
import { ShoppingTab } from './components/ShoppingTab';
import { PasswordGate } from './components/PasswordGate';
import { needsShopping } from './lib/utils';

export default function App() {
  const { unlocked, unlock, lock } = usePasswordAuth();
  const [tab, setTab] = useState<TabId>('despensa');
  const store = useStore();

  const shoppingCount = useMemo(
    () => store.shoppingList.filter(e => !e.is_checked).length,
    [store.shoppingList]
  );

  const alertCount = useMemo(
    () => store.items.filter(needsShopping).length,
    [store.items]
  );

  if (!unlocked) {
    return <PasswordGate onUnlock={unlock} />;
  }

  return (
    <div className="flex flex-col h-svh max-w-[480px] mx-auto bg-slate-50">
      {/* Header */}
      <header className="flex-shrink-0 bg-white border-b border-slate-100 px-4 pt-safe">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center">
              <Package size={18} color="white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 leading-tight">Rebost</h1>
              <p className="text-[10px] text-slate-400 leading-none">{store.items.length} productes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {alertCount > 0 && (
              <div className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-2 py-1.5 rounded-full border border-amber-200">
                <AlertCircle size={13} strokeWidth={2} />
                <span className="text-xs font-semibold">{alertCount} s'acaben</span>
              </div>
            )}
            <button
              onClick={lock}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition"
              title="Tancar sessió"
            >
              <LogOut size={17} strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      {/* Tab content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {tab === 'despensa' ? (
          <InventoryTab
            items={store.items}
            onAdd={store.addItem}
            onUpdate={store.updateItem}
            onDelete={store.deleteItem}
            onAdjust={store.adjustQuantity}
            onToggleFavorite={store.toggleFavorite}
          />
        ) : (
          <ShoppingTab
            shoppingList={store.shoppingList}
            onToggleCheck={store.toggleShoppingCheck}
            onDelete={store.deleteShoppingItem}
            onAddManual={store.addManualShoppingItem}
            onClearChecked={store.clearCheckedShopping}
          />
        )}
      </main>

      {/* Bottom navigation */}
      <nav className="flex-shrink-0 bg-white border-t border-slate-100 pb-safe">
        <div className="flex">
          <button
            onClick={() => setTab('despensa')}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition ${
              tab === 'despensa' ? 'text-emerald-600' : 'text-slate-400'
            }`}
          >
            <Package size={22} strokeWidth={tab === 'despensa' ? 2.2 : 1.8} />
            <span className="text-[11px] font-semibold">Rebost</span>
          </button>

          <button
            onClick={() => setTab('compra')}
            className={`flex-1 flex flex-col items-center gap-1 py-3 relative transition ${
              tab === 'compra' ? 'text-emerald-600' : 'text-slate-400'
            }`}
          >
            <div className="relative">
              <ShoppingCart size={22} strokeWidth={tab === 'compra' ? 2.2 : 1.8} />
              {shoppingCount > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[17px] h-[17px] bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                  {shoppingCount}
                </span>
              )}
            </div>
            <span className="text-[11px] font-semibold">Compra</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
