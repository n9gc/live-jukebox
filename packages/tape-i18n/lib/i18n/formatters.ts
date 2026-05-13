/**
 * i18n 的格式化器
 * @license MIT
 * @author n9gc
 */
declare module 'tape-i18n/i18n/formatters';

import type { Intersected } from 'tape-i18n/types';
import { thr } from 'tape-i18n/utility';

/**注册可变名称的格式化函数的信息 */
export interface DynamicInfo<
	S extends string = string,
	E extends string = string,
	P = any,
	R = unknown,
> {
	/**名称起始标志 */
	readonly sign: [start: S, end: E];
	/**格式化函数本身 */
	format(key: string, data: P): R;
}

/**信息对应的可变名称格式化函数 */
export type DynamicFormatters<I extends DynamicInfo> = I extends DynamicInfo<
	infer S extends string,
	infer E extends string,
	infer P,
	infer R
> ? Record<`${S}${string}${E}`, (data: P) => R> : never;

/**
 * 得到一个格式化器对象
 * @param formatters 普通格式化函数的对象
 * @param infos 可变名称格式化函数的描述
 * @returns 格式化器对象
 */
export function createFormatters<
	const T extends Record<string, (parameter: any) => unknown>,
	const I extends DynamicInfo[],
>(formatters: T, ...infos: I): Intersected<DynamicFormatters<I[number]>> & T {
	const checkDynamics = (p: keyof any): undefined | Function => {
		if (typeof p !== 'string') return;
		for (const { sign: [start, end], format } of infos) {
			if (!p.startsWith(start) || !p.endsWith(end)) continue;
			const key = p.slice(start.length, -end.length || void 0);
			return (data: any) => format(key, data);
		}
		return;
	};
	return new Proxy<any>(formatters, {
		get(target, p, receiver) {
			return checkDynamics(p)
				?? Reflect.get(target, p, receiver)
				?? thr(new Error(`No i18n formatter named "${p.toString()}"`, target));
		},
	});
}

/**格式化器 */
export type Formatters = Record<string, (value: any) => unknown>;

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

