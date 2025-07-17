import { useTheme } from "~/contexts/ThemeContext";
import "./ThemeToggle.css";
import SunIcon from "~/components/svgs/SunIcon";
import MoonIcon from "~/components/svgs/MoonIcon";

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

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
