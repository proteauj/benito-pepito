import { useI18n } from '../i18n/I18nProvider';

export function useProductTranslations() {
  const { locale } = useI18n();

  const getTranslatedText = (product: any, field: 'title' | 'description' | 'medium') => {
    if (locale === 'fr') {
      return product[`${field}Fr`] || product[field];
    }
    return product[field];
  };

  return { getTranslatedText };
}
