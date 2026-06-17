import { i18n as initI18n, i18nObject as initI18nObject, i18nString as initI18nString } from "typesafe-i18n";
import { detectLocale as detectLocaleFn } from "typesafe-i18n/detectors";
import { initExtendDictionary } from "typesafe-i18n/utils";
const baseLocale = "en";
const locales = [
  "en",
  "zh"
];
const isLocale = (locale) => locales.includes(locale);
const loadedLocales = {};
const loadedFormatters = {};
const extendDictionary = initExtendDictionary();
const i18nString = (locale) => initI18nString(locale, loadedFormatters[locale]);
const i18nObject = (locale) => initI18nObject(
  locale,
  loadedLocales[locale],
  loadedFormatters[locale]
);
const i18n = () => initI18n(loadedLocales, loadedFormatters);
const detectLocale = (...detectors) => detectLocaleFn(baseLocale, locales, ...detectors);
export {
  baseLocale,
  detectLocale,
  extendDictionary,
  i18n,
  i18nObject,
  i18nString,
  isLocale,
  loadedFormatters,
  loadedLocales,
  locales
};
