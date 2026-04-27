/**
 * i18n 的格式化器
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/i18n/formatters';

import type { FormattersInitializer } from 'typesafe-i18n';
import type { Formatters, Locales } from './i18n-types';

export const initFormatters: FormattersInitializer<Locales, Formatters> = () => {
	const formatters: Formatters = {
		/**把布尔值变成 yes 和 no */
		bool: (value: boolean) => (value ? 'yes' : 'no'),
		/**获得不被转译的 `'{*}'` ，以 `{?|star}` 的方法使用 */
		star: () => '{*}',
	};
	return formatters;
};
