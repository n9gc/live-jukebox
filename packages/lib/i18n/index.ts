/**
 * 多语言选项
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/i18n';

export * from './enum';
export * from './formatters';
export * from './i18n-node';
export * from './i18n-types';
export * from './i18n-util';
export * from './locale';

import { getLogger } from '@logtape/logtape';
import type * as lib from 'lib';
import type { AllEnumTranslation } from './enum';
import { L } from './i18n-node';
import { locale } from './locale';

declare global {
	interface globalLL {
		/**基础库 */
		lib: typeof packageLL;
	}
}

/**库的多语言对象 */
export const packageLL = L[locale];
globalLL.lib = packageLL;

/**库的多语言翻译对象 */
export type Base = AllEnumTranslation
	& Record<keyof typeof lib, Record<string, Record<string, string>>>;

/**输出当前检测到的语言 */
export function logDetectedLang() {
	getLogger(['lib', 'i18n', 'index'])
		.info(packageLL.i18n.index.langDetected({ locale }));
}

