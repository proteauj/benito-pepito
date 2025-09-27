"use client";

import { useI18n } from "../i18n/I18nProvider";

export default function LanguageSelector() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="relative">
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as "en" | "fr")}
        className="bg-transparent border-none px-3 py-1 rounded text-md focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]/40"
      >
        <option value="fr">Fr</option>
        <option value="en">En</option>
      </select>
    </div>
  );
}
