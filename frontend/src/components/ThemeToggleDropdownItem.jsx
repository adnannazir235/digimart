import { useEffect, useState } from "react";
import { IoSunny } from "react-icons/io5";
import { LuMoon } from "react-icons/lu";

export default function ThemeToggleDropdownItem({
  variant = "nav", // "nav" for standalone button, "dropdown" for menu item
  isMobile = false, // Determines icon size
  className = "",
}) {
  const [theme, setTheme] = useState(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.getAttribute("data-bs-theme") || "light";
    }
    return "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const isDark = theme === "dark";
  const Icon = isDark ? IoSunny : LuMoon;
  const label = isDark ? "Light Mode" : "Dark Mode";

  // Simplified styling logic based on variant
  const baseClasses =
    variant === "dropdown"
      ? "dropdown-item d-flex align-items-center gap-2"
      : "btn text-muted border border-1 me-2 ms-auto";

  return (
    <button onClick={toggleTheme} className={`${baseClasses} ${className}`}>
      <Icon size={isMobile ? 23 : 16} aria-hidden />
      {variant === "dropdown" && label}
    </button>
  );
}
