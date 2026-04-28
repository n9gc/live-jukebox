/**
 * i18n 的格式化器
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/i18n/formatters';

import { globalLL } from 'lib/i18n';
import { mixLogable } from 'lib/util';
import type { FormattersInitializer } from 'typesafe-i18n';
import { AllEnum, translateEnum } from './enum';
import type { Formatters, Locales } from './i18n-types';

export const initFormatters: FormattersInitializer<Locales, Formatters> = () => {
	const formatters = {
		/**把布尔值变成 yes 和 no */
		bool(value: boolean) {
			return value ? 'yes' : 'no';
		},
		enums(sym: AllEnum) {
			return translateEnum(globalLL, sym);
		},
	} as Formatters;
	return mixLogable(formatters);
};
