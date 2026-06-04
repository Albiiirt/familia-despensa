const STORAGE_KEY = 'despensa_auth';
const APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD as string | undefined;

function isUnlocked(): boolean {
  return (
    localStorage.getItem(STORAGE_KEY) === '1' ||
    sessionStorage.getItem(STORAGE_KEY) === '1'
  );
}

export function usePasswordAuth() {
  const unlocked = isUnlocked();

  const unlock = (password: string, remember: boolean): boolean => {
    if (!APP_PASSWORD || password !== APP_PASSWORD) return false;
    if (remember) {
      localStorage.setItem(STORAGE_KEY, '1');
    } else {
      sessionStorage.setItem(STORAGE_KEY, '1');
    }
    return true;
  };

  const lock = () => {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  return { unlocked, unlock, lock };
}
