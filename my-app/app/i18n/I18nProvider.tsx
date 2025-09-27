"use client";

import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import en from "./messages/en.json";
import fr from "./messages/fr.json";

type Locale = "en" | "fr";
type Messages = Record<string, string>;

const DICTS: Record<Locale, Messages> = { en, fr } as const;

function normalizeLocale(input?: string): Locale {
  const v = (input || "en").toLowerCase();

  // Detect Quebec/Canada French
  if (v.startsWith("fr-ca") || v.startsWith("fr") || v.includes("quebec") || v.includes("canada")) {
    return "fr";
  }

  // Detect other French variants
  if (v.startsWith("fr-")) {
    return "fr";
  }

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

  // On client, refine from navigator and geolocation if not explicitly provided
  useEffect(() => {
    if (initialLocale !== "en") return; // trust server-provided locale

    if (typeof navigator !== "undefined") {
      // First try to detect from navigator language
      const detectedLocale = normalizeLocale(navigator.language);
      if (detectedLocale !== "en") {
        setLocale(detectedLocale);
        return;
      }

      // If English detected, try to detect Quebec/Canada from other signals
      const userAgent = navigator.userAgent.toLowerCase();
      const language = navigator.language.toLowerCase();

      // Check for Quebec/Canada indicators
      if (userAgent.includes("quebec") ||
          userAgent.includes("canada") ||
          language.includes("ca") ||
          userAgent.includes("montreal") ||
          userAgent.includes("toronto") ||
          userAgent.includes("vancouver")) {
        setLocale("fr");
        return;
      }

      // Check timezone for Quebec (Eastern Time)
      if (Intl.DateTimeFormat().resolvedOptions().timeZone.includes("America/Montreal") ||
          Intl.DateTimeFormat().resolvedOptions().timeZone.includes("America/Toronto")) {
        setLocale("fr");
        return;
      }
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
