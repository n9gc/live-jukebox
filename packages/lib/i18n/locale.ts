/**
 * i18n 的语言判断相关
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/i18n/locale';

import { getLogger } from '@logtape/logtape';
import { bcp47Normalize } from 'bcp-47-normalize';
import { detectLocale } from './i18n-util';

const logger = getLogger(['lib', 'i18n', 'locale']);

/**规范化语言地区标签 */
function normalize(tag: string): string {
	return bcp47Normalize(tag, {
		warning(reason, code, offset) {
			logger.warn(
				`parse {tag} error: {reason}, with code={code} at offset={offset}.`
				+ `\nsee code at https://github.com/wooorm/bcp-47#warnings`,
				{ code, offset, reason, tag },
			);
		},
	});
}

/**会被检查的环境变量 */
const environmentKeys = [
	'LANG',
	'LC_ALL',
	'LC_MESSAGES',
	'LANGUAGE',
];
/**检测环境变量的语言 */
export function environmentDetector(): string[] {
	if (typeof process === 'undefined') return [];
	return environmentKeys
		.map(name => process.env[name])
		.filter(n => n !== void 0)
		.map(n => normalize(n));
}

/**通过 Intl API 检测语言 */
export function intlDetector(): string[] {
	const { locale: localeString } = Intl.DateTimeFormat().resolvedOptions();
	const loacle = new Intl.Locale(localeString);
	const minLocale = loacle.minimize().toString();
	const maxLocale = loacle.maximize().toString();
	return [localeString, maxLocale, minLocale].map(n => normalize(n));
}

/**最终检测出的语言 */
export const locale = detectLocale(environmentDetector, intlDetector);

