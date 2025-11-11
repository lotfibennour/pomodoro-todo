export type Locale = 'en' | 'fr' | 'ar';

export const locales: Locale[] = ['en', 'fr', 'ar'];
export const defaultLocale: Locale = 'en';
export const localeNames: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  ar: 'العربية'
};