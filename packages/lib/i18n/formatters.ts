/**
 * i18n 的格式化器
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/i18n/formatters';

import { packageLL } from 'lib/i18n';
import { createFormatters, tapeFomatters } from 'tape-i18n';
import { translateEnum } from './enum';

/**获取格式化对象 */
const getLL = () => packageLL.i18n.formatters;
/**格式化器 */
export const packageFormatters = createFormatters(
	tapeFomatters({
		/**把布尔值变成 yes 和 no */
		bool: (isTrue: boolean) => (isTrue ? 'yes' : 'no'),
		/**翻译枚举 */
		enums: translateEnum as (n: symbol) => string,
		/**把东西用引号引起来 */
		quote: (inner: string): string => getLL().quoted(packageFormatters.rawLog(inner)),
		/**把一些东西用引号引起来 */
		quotes: (inners: string[]): string => inners
			.map(n => packageFormatters.quote(n))
			.join(getLL().quotedSpliter()),
		/**获取一个东西的 `length` */
		length: (n: { readonly length: number }) => n.length.toString(),
	}),
	{
		sign: ['join(', ')'],
		format: (key: string, data: string[]) => data.join(key),
	},
);

/**初始化格式化器对象 */
export function initFormatters(_: unknown) {
	return packageFormatters;
}

