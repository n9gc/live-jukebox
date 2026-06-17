import { initFormatters } from "./formatters";
import { loadedFormatters, loadedLocales, locales } from "./i18n-util";
import en from "./en";
import zh from "./zh";
const localeTranslations = {
  en,
  zh
};
const loadLocale = (locale) => {
  if (loadedLocales[locale]) return;
  loadedLocales[locale] = localeTranslations[locale];
  loadFormatters(locale);
};
const loadAllLocales = () => locales.forEach(loadLocale);
const loadFormatters = (locale) => void (loadedFormatters[locale] = initFormatters(locale));
export {
  loadAllLocales,
  loadFormatters,
  loadLocale
};
