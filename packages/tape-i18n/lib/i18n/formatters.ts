/**
 * i18n 的格式化器
 * @license MIT
 * @author n9gc
 */
declare module 'tape-i18n/i18n/formatters';

import { createFormatters } from 'tape-i18n/i18n/dynamic-formatter';
import type { Formatters } from 'tape-i18n/types';
import type { FormattersInitializer } from 'typesafe-i18n';
import type { Locales } from './i18n-types';

/**
 * 添加 `tape-i18n` 提供的格式化器
 * @param formatters 你的格式化器
 * @returns 添加后的格式化器
 */
export function tapeFomatters<T extends Formatters>(formatters: T) {
	return createFormatters(
		Object.assign(formatters, {
			/**用这个来隐藏需要的字段，但是类型上保证字段一定出现 */
			inError: () => '',
			/**
			 * 不再需要手动指定参数名，直接 `{key: symbol|log}` 就行
			 * 详见 lib/util/logger
			 */
			log: () => '',
		}),
		{
			sign: ['log_', ''],
			/**
			 * 添加可以用于 logtape 的函数
			 * 只要 `{key: symbol|log_key}` 或者 `{obj: Info|log_obj}` 这样使用
			 * `LoggerWrap` 就能通过 logtape 输出这些值，而不是简单用 i18n 拼接字符串
			 */
			format: (key: string) => `{${key}}`,
		},
	);
}

export const initFormatters: FormattersInitializer<Locales, Formatters> = (_: Locales) => {
	return tapeFomatters({});
};

