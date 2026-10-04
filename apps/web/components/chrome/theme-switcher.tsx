'use client';

import { useSyncExternalStore } from 'react';

type Theme = 'system' | 'light' | 'dark';

function readTheme(): Theme {
  try {
    const value = localStorage.getItem('quorumscope-theme');
    return value === 'light' || value === 'dark' ? value : 'system';
  } catch {
    return 'system';
  }
}

export function ThemeSwitcher() {
  const theme = useSyncExternalStore(
    callback => {
      window.addEventListener('storage', callback);
      window.addEventListener('quorumscope-theme-change', callback);
      return () => {
        window.removeEventListener('storage', callback);
        window.removeEventListener('quorumscope-theme-change', callback);
      };
    },
    readTheme,
    () => 'system',
  );

  function changeTheme(next: Theme) {
    try {
      if (next === 'system') localStorage.removeItem('quorumscope-theme');
      else localStorage.setItem('quorumscope-theme', next);
    } catch {
      // The active page theme still changes when storage is unavailable.
    }
    if (next === 'system') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = next;
    window.dispatchEvent(new Event('quorumscope-theme-change'));
  }

  return <label className="theme-control">Theme
    <select aria-label="Theme" value={theme} onChange={event => changeTheme(event.target.value as Theme)}>
      <option value="system">System</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>;
}
