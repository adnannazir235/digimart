import { useEffect, useState } from "react";

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
    // Dispatch event so ALL components know
    window.dispatchEvent(new CustomEvent("cart-updated", { detail: value }));
  }, [key, value]);

  return [value, setValue];
}
