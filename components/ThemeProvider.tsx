"use client";

import * as React from "react";

// 1. 创建上下文，默认值只包含我们需要的方法
type ThemeContextType = {
  theme: string;
  setTheme: (theme: string) => void;
};

const ThemeContext = React.createContext<ThemeContextType>({
  theme: "system",
  setTheme: () => null,
});

// 2. 导出自定义 Hook，供 ThemeToggle 使用
export const useTheme = () => React.useContext(ThemeContext);

type ThemeProviderProps = {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
};

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState(defaultTheme);

  // 3. 监听 theme 变化，修改 html 的 class
  React.useEffect(() => {
    const root = window.document.documentElement;

    // 移除旧状态
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      return;
    }

    // 添加新状态
    root.classList.add(theme);
  }, [theme]);

  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
    }),
    [theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
