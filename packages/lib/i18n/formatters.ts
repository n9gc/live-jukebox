/**
 * i18n 的格式化器
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/i18n/formatters';

import { packageLL } from 'lib/i18n';
import { createFormatters, tapeFomatters } from 'tape-i18n';
import { translateEnum } from './enum';

/**格式化器 */
export const packageFormatters = createFormatters(
	tapeFomatters({
		/**把布尔值变成 yes 和 no */
		bool: (value: boolean) => (value ? 'yes' : 'no'),
		/**翻译枚举 */
		enums: translateEnum as (n: symbol) => string,
		/**把东西用引号引起来 */
		quote: (inner: string) => packageLL.i18n.formatters.quoted(inner),
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

