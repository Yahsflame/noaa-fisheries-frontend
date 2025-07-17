import { createContext, useContext, createSignal, onMount } from "solid-js";

const ThemeContext = createContext();

export function ThemeProvider(props) {
  const [isDark, setIsDark] = createSignal(false);

  onMount(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

      const shouldBeDark = savedTheme === "dark" || (!savedTheme && systemPrefersDark);

      setIsDark(shouldBeDark);
      applyTheme(shouldBeDark);
    }
  });

  const applyTheme = (dark) => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    }
  };

  const toggleTheme = () => {
    const newIsDark = !isDark();
    setIsDark(newIsDark);
    applyTheme(newIsDark);

    if (typeof localStorage !== "undefined") {
      localStorage.setItem("theme", newIsDark ? "dark" : "light");
    }
  };

  const value = {
    isDark,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {props.children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
