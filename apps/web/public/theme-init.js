try {
  const theme = localStorage.getItem('quorumscope-theme');
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
} catch {
  // The system preference applies when storage is unavailable.
}
