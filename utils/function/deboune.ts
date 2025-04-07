export function debounce<
  T extends (...args: Parameters<T>) => void | Promise<void>
>(func: T, delay: number = 400) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
