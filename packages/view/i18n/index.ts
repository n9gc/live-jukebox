/**
 * 界面的多语言选项
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module '.';

export * from './i18n-node';
export * from './i18n-types';
export * from './i18n-util';

import { locale } from 'lib/i18n';
import { LLMappers } from 'lib/util';
import { getLoggerIniterWithLL, innerGlobalLL } from 'tape-i18n';
import { L } from './i18n-node';

declare global {
	interface globalLL {
		/**播放器前端 */
		'#app': typeof packageLL;
	}
}

/**本包的多语言对象 */
const packageLL = L[locale];
globalLL['#app'] = packageLL;

export const initLogger = getLoggerIniterWithLL(innerGlobalLL, LLMappers);

