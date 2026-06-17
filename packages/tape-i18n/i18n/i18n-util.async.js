import { initFormatters } from "./formatters";
import { loadedFormatters, loadedLocales, locales } from "./i18n-util";
const localeTranslationLoaders = {
  en: () => import("./en"),
  zh: () => import("./zh")
};
const updateDictionary = (locale, dictionary) => loadedLocales[locale] = { ...loadedLocales[locale], ...dictionary };
const importLocaleAsync = async (locale) => (await localeTranslationLoaders[locale]()).default;
const loadLocaleAsync = async (locale) => {
  updateDictionary(locale, await importLocaleAsync(locale));
  loadFormatters(locale);
};
const loadAllLocalesAsync = () => Promise.all(locales.map(loadLocaleAsync));
const loadFormatters = (locale) => void (loadedFormatters[locale] = initFormatters(locale));
export {
  importLocaleAsync,
  loadAllLocalesAsync,
  loadFormatters,
  loadLocaleAsync
};
