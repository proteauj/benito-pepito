"use client";

import { useI18n } from "../i18n/I18nProvider";


export default function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="pt-16 bg-white border-t border-[#cfc9c0] text-[var(--foreground)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-3 mouly-font">Benito Pepito</h3>
            <p className="text-black/70">{t('footer.blurb')}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">{t('footer.explore')}</h4>
            <ul className="space-y-2 text-black/70">
              <li><a href="/categories" className="hover:text-[var(--gold)]">{t('nav.categories')}</a></li>
              <li><a href="/about" className="hover:text-[var(--gold)]">{t('about.title')}</a></li>
              <li><a href="/contact" className="hover:text-[var(--gold)]">{t('contact.title')}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">{t('footer.contact')}</h4>
            <ul className="space-y-2 text-black/70">
              <li>
                <a href="mailto:info@benitopepito.art" className="hover:text-[var(--gold)]">info@benitopepito.art</a>
              </li>
              <li>{t('footer.address')}</li>
              <li>{t('footer.hours')}</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">{t('footer.follow')}</h4>
            <ul className="space-y-2 text-black/70">
              <li>
                <a href="https://www.instagram.com/benitopepito_artist?igsh=MTJxMTZjbmlyNGMw&utm_source=qr" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--gold)]">{t('social.instagram')}</a>
              </li>
              <li>
                <a href="http://www.tiktok.com/@benitopepito_artist" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--gold)]">{t('social.tiktok')}</a>
              </li>
              <li>
                <a href="https://www.facebook.com/share/19a3sMG4YU/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--gold)]">{t('social.facebook')}</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#cfc9c0] mt-8 pt-6 text-center text-black/60">
          <p>© {new Date().getFullYear()} Benito Pepito. {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
}
