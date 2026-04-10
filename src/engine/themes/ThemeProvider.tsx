"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ThemeDefinition } from "../core/types";

const ThemeCtx = createContext<ThemeDefinition>(null!);

export function useEngineTheme() {
  return useContext(ThemeCtx);
}

export function EngineThemeProvider({
  theme,
  children,
}: {
  theme: ThemeDefinition;
  children: ReactNode;
}) {
  return <ThemeCtx value={theme}>{children}</ThemeCtx>;
}
