import { useTheme } from "~/contexts/ThemeContext";
import "./ThemeToggle.css";

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  // Sun SVG Icon
  const SunIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="theme-icon"
    >
      <circle cx="12" cy="12" r="5" fill="currentColor" />
      <path
        d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );

  // Moon SVG Icon
  const MoonIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="theme-icon"
    >
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
        fill="currentColor"
      />
    </svg>
  );

  return (
    <button
      class="theme-toggle btn-icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark() ? "light" : "dark"} mode`}
      title={`Switch to ${isDark() ? "light" : "dark"} mode`}
    >
      {isDark() ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
