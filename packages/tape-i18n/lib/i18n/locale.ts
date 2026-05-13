/**
 * i18n 的语言判断相关
 * @license MIT
 * @author n9gc
 */
declare module 'tape-i18n/i18n/locale';

import { TranslationFunctions } from './i18n-types';
import { L } from './i18n-node';
import { baseLocale, detectLocale, locales } from './i18n-util';

/**给 `tape-i18n` 设置的语言 */
export const tapeI18nLocalesNow = [...locales];

/**跟随设置的语言，动态获取 LL */
const handler: ProxyHandler<TranslationFunctions> = {
	get(_, p) {
		const locale = detectLocale(() => tapeI18nLocalesNow);
		return Reflect.get(L[locale], p, L[locale]);
	},
};

/**库的多语言对象 */
export const packageLL = new Proxy(L[baseLocale], handler);

