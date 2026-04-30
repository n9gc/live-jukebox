/**
 * B 站弹幕读取器的多语言选项
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module '.';

export * from './i18n-node';
export * from './i18n-types';
export * from './i18n-util';

import { innerGlobalLL, locale } from 'lib/i18n';
import { getLoggerIniter } from 'lib/util';
import { L } from './i18n-node';

declare global {
	interface globalLL {
		/**B 站弹幕读取器 */
		'reader-bili': typeof packageLL;
	}
}

/**本包的多语言对象 */
const packageLL = L[locale];
globalLL['reader-bili'] = packageLL;

export const initLogger = getLoggerIniter(innerGlobalLL);

