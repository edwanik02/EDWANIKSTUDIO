"use client";
import { useEffect } from "react";

export interface ThemeSettings {
  primaryColor?: string | null;
  accentColor?: string | null;
  fontHeading?: string | null;
  fontBody?: string | null;
  buttonStyle?: string | null;
  cardStyle?: string | null;
}

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace("#", "").match(/^([0-9a-f]{6}|[0-9a-f]{3})$/i);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function applyTheme(settings: ThemeSettings) {
  const root = document.documentElement;
  const primary = settings.primaryColor || "#FF6B35";
  const accent = settings.accentColor || "#FFA500";
  const rgb = hexToRgb(primary);
  if (rgb) {
    root.style.setProperty("--primary", primary);
    root.style.setProperty("--ring", primary);
    root.style.setProperty("--sidebar-primary", primary);
    root.style.setProperty("--chart-1", primary);
  }
  const aRgb = hexToRgb(accent);
  if (aRgb) {
    root.style.setProperty("--accent", accent);
    root.style.setProperty("--chart-5", accent);
  }
  if (settings.buttonStyle === "pill") root.style.setProperty("--radius", "2rem");
  else if (settings.buttonStyle === "sharp") root.style.setProperty("--radius", "0.125rem");
  else root.style.setProperty("--radius", "0.625rem");
}

export function ThemeProvider({ settings, children }: { settings: ThemeSettings; children: React.ReactNode }) {
  useEffect(() => {
    applyTheme(settings);
  }, [settings.primaryColor, settings.accentColor, settings.buttonStyle]);
  return <>{children}</>;
}
