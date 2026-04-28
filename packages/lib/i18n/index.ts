/**
 * 多语言选项
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/i18n';

export * from './enum';
export * from './formatters';
export * from './i18n-node';
export * from './i18n-react';
export { default as TypesafeI18n } from './i18n-react';
export * from './i18n-types';
export * from './i18n-util';
export * from './locale';

import type * as lib from 'lib';
import type { AllEnumTranslation } from './enum';
import { L } from './i18n-node';
import { locale } from './locale';

/**多语言对象 */
export const globalLL = { lib: L[locale] };
export type globalLL = typeof globalLL;

/**库的多语言翻译对象 */
export type Base = AllEnumTranslation & Record<keyof typeof lib, Record<string, Record<string, string>>>;

// eslint-disable-next-line no-console
console.log(globalLL.lib.i18n.index.langDetected({ locale }));


