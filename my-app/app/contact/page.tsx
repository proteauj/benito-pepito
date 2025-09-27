'use client';

import { useI18n } from "../i18n/I18nProvider";

export default function ContactPage() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen stoneBg text-[var(--foreground)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="leafy-divider pb-3 mb-6">
          <h1 className="text-4xl font-bold">{t('contact.title')}</h1>
        </div>
        <p className="text-lg text-black/80 leading-relaxed mb-8">
          {t('contact.description')}
        </p>

        <form className="grid grid-cols-1 gap-6 bg-white border border-[#cfc9c0] p-6">
          <div>
            <label className="block text-sm font-medium text-black mb-1">{t('contact.form.name')}</label>
            <input
              type="text"
              className="w-full border border-[#cfc9c0] px-3 py-2 text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]/40"
              placeholder={t('contact.form.placeholderName')}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">{t('contact.form.email')}</label>
            <input
              type="email"
              className="w-full border border-[#cfc9c0] px-3 py-2 text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]/40"
              placeholder={t('contact.form.placeholderEmail')}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">{t('contact.form.message')}</label>
            <textarea
              rows={6}
              className="w-full border border-[#cfc9c0] px-3 py-2 text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]/40"
              placeholder={t('contact.form.placeholderMessage')}
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-black/70">{t('contact.direct')} <a href="mailto:info@benitopepito.art" className="underline">info@benitopepito.art</a></p>
            <button
              type="submit"
              className="inline-flex items-center bg-[var(--gold)] text-black font-semibold px-6 py-3 hover:bg-[var(--gold-dark)]"
            >
              {t('actions.sendMessage')}
            </button>
          </div>
        </form>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#cfc9c0] p-6">
            <h2 className="text-xl font-semibold mb-2">{t('contact.gallery')}</h2>
            <p className="text-black/80">Mon–Sat, 10:00–18:00</p>
            <p className="text-black/80">123 Stone Avenue, Montreal, QC</p>
          </div>
          <div className="bg-white border border-[#cfc9c0] p-6">
            <h2 className="text-xl font-semibold mb-2">{t('contact.press')}</h2>
            <p className="text-black/80">press@benitopepito.art</p>
          </div>
          <div className="bg-white border border-[#cfc9c0] p-6">
            <h2 className="text-xl font-semibold mb-2">{t('contact.sales')}</h2>
            <p className="text-black/80">sales@benitopepito.art</p>
          </div>
        </div>
      </div>
    </div>
  );
}
