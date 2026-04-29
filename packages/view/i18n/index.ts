/**
 * 界面的多语言选项
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/i18n';

export * from './i18n-node';
export * from './i18n-react';
export { default as TypesafeI18n } from './i18n-react';
export * from './i18n-types';
export * from './i18n-util';

import { innerGlobalLL, locale } from 'lib/i18n';
import { getLoggerIniter } from 'lib/util';
import { L } from './i18n-node';

declare global {
	interface globalLL {
		/**B 站弹幕读取器 */
		view: typeof packageLL;
	}
}

/**本包的多语言对象 */
const packageLL = L[locale];
globalLL.view = packageLL;

export const initLogger = getLoggerIniter(innerGlobalLL);

