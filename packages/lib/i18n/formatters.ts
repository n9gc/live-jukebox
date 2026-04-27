/**
 * i18n 的格式化器
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/i18n/formatters';

import { getLL } from 'lib/i18n';
import { translateEnum } from './enum';
import { initLogger } from 'lib/util';
import type { FormattersInitializer } from 'typesafe-i18n';
import type { Formatters, Locales } from './i18n-types';

const { thr } = initLogger(['i18n', 'formatters']);

export const initFormatters: FormattersInitializer<Locales, Formatters> = () => {
	const formatters: Formatters = {
		/**把布尔值变成 yes 和 no */
		bool(value) {
			return value ? 'yes' : 'no';
		},
		/**获得不被转译的 `'{*}'` ，以 `{?|star}` 的方法使用 */
		star(key = '*') {
			return `{${key}}`;
		},
		json(n: unknown) {
			try {
				return JSON.stringify(n);
			} catch (error) {
				const LL = getLL();
				return thr(LL.i18n.cannotStringify('n'), { error, n });
			}
		},
		enums(sym) {
			return translateEnum(getLL(), sym);
		},
	};
	return formatters;
};
