/**
 * i18n 的格式化器
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/i18n/formatters';

import type { FormattersInitializer } from 'typesafe-i18n';
import type { AllEnum } from './enum';
import { translateEnum } from './enum';
import type { Formatters, Locales } from './i18n-types';

/**
 * 给格式化器对象添加通过名字来传递参数的格式化函数
 * @param start 格式化函数的开头
 * @param end 格式化函数的结尾，开头和结尾中间的东西被算作参数
 * @param formatter 格式化函数本身
 * @param formatters 格式化器对象
 * @returns 添加了函数的格式化器对象
 */
export function mixDynamic<S extends string, E extends string, T, P, R>(
	start: S,
	end: E,
	formatter: (key: string, data: P) => R,
	formatters: T,
): T & Record<`${S}${string}${E}`, (data: P) => R> {
	return new Proxy<any>(formatters, {
		get(target, p) {
			if (
				typeof p !== 'string'
				|| !p.startsWith(start)
				|| !p.endsWith(end)
			) return Reflect.get(target, p);
			const key = p.slice(start.length, -end.length);
			return (data: P) => formatter(key, data);
		},
	});
}

/**初始化格式化器对象 */
export const initFormatters: FormattersInitializer<Locales, Formatters> = () => {
	let formatters = {
		/**把布尔值变成 yes 和 no */
		bool(value: boolean) {
			return value ? 'yes' : 'no';
		},
		/**翻译枚举 */
		enums(sym: AllEnum) {
			return translateEnum(sym);
		},
	} as Formatters;
	// 添加可以用于 logtape 的函数
	// 只要 `{key: symbol|log_key}` 或者 `{obj: Info|log_obj}` 这样使用
	// `LoggerWrap` 就能通过 logtape 输出这些值，而不是简单用 i18n 拼接字符串
	formatters = mixDynamic(
		'log_',
		'',
		key => `{${key}}`,
		formatters,
	);
	// 添加类似 `Array['join']` 的函数
	// `{list: string[]|join(,)}` 就等于 `list.join(',')`
	formatters = mixDynamic(
		'join(',
		')',
		(key, list: string[]) => list.join(key),
		formatters,
	);
	return formatters;
};
