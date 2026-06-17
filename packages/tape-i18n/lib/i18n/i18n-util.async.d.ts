import type { Locales, Translations } from './i18n-types';
export declare const importLocaleAsync: (locale: Locales) => Promise<Translations>;
export declare const loadLocaleAsync: (locale: Locales) => Promise<void>;
export declare const loadAllLocalesAsync: () => Promise<void[]>;
export declare const loadFormatters: (locale: Locales) => void;
