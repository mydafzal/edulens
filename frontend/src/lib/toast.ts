export function showToast(message: string, type: 'success' | 'info' | 'warning' = 'success') {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('scora-toast', { detail: { message, type } }));
}
