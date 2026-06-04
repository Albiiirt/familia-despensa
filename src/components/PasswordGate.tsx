import { useState } from 'react';
import { Package, Lock, Eye, EyeOff } from 'lucide-react';

interface Props {
  onUnlock: (password: string, remember: boolean) => boolean;
}

export function PasswordGate({ onUnlock }: Props) {
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = onUnlock(password, remember);
    if (!ok) {
      setError(true);
      setShake(true);
      setPassword('');
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 mb-4">
            <Package size={32} color="white" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Rebost Familiar</h1>
          <p className="text-sm text-slate-400 mt-1">Introdueix la contrasenya per entrar</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className={`bg-white rounded-2xl shadow-sm border p-6 space-y-4 transition ${
            shake ? 'animate-shake border-red-200' : 'border-slate-100'
          }`}
        >
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Contrasenya</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(false); }}
                placeholder="Contrasenya familiar"
                autoComplete="current-password"
                autoFocus
                className={`w-full pl-9 pr-10 py-3 rounded-xl border text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:border-transparent transition ${
                  error
                    ? 'border-red-300 focus:ring-red-300'
                    : 'border-slate-200 focus:ring-emerald-400'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && (
              <p className="text-xs text-red-500 pt-1">Contrasenya incorrecta</p>
            )}
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setRemember(v => !v)}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition ${
                remember ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'
              }`}
            >
              {remember && (
                <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                  <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="text-sm text-slate-600">Recordar en aquest dispositiu</span>
          </label>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-semibold rounded-xl transition"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
