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

import { L } from './i18n-node';
import { locale } from './locale';

export const LL = L[locale];

export function getLL() {
	return LL;
}
// eslint-disable-next-line no-console
console.log(LL.i18n.langDetected({ locale }));

