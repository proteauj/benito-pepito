"use client";

import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import en from "./messages/en.json";
import fr from "./messages/fr.json";

type Locale = "en" | "fr";
type Messages = Record<string, string>;

const DICTS: Record<Locale, Messages> = { en, fr } as const;

function normalizeLocale(input?: string): Locale {
  const v = (input || "en").toLowerCase();
  if (v.startsWith("fr")) return "fr";
  return "en";
}

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children, initialLocale = "en" as Locale }: { children: React.ReactNode; initialLocale?: Locale }) {
  const [locale, setLocale] = useState<Locale>(normalizeLocale(initialLocale));

  // On client, refine from navigator if not explicitly provided
  useEffect(() => {
    if (initialLocale) return; // trust server-provided
    if (typeof navigator !== "undefined") {
      setLocale(normalizeLocale(navigator.language));
    }
  }, [initialLocale]);

  const dict = DICTS[locale] || DICTS.en;
  const value = useMemo(() => ({
    locale,
    setLocale,
    t: (key: string) => dict[key] ?? key,
  }), [locale, dict]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
