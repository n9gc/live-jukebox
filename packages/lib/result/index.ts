/**
 * 操作结果的表示相关
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/result';

export * from './results';
export * from './defines';

import { Enumified, mark } from 'lib/types/enum';
import * as results from './results';
import { Result, ResultOk } from './results';

/**判断 `n` 是不是成功的操作 */
export function isOk<T>(n: T | symbol):
	n is Exclude<T, symbol> {
	return typeof n !== 'symbol' || n === ResultOk.Ok;
}

/**判断 `n` 是不是失败的操作 */
export function isNotOk<T>(n: T | symbol):
	n is T extends symbol ? T : never {
	return typeof n === 'symbol' && n !== ResultOk.Ok;
}

/**
 * 函数的结果
 * 错误的原因千千万，只有指定的枚举才能携带结果
 * @template T 所有可能的枚举
 * @template O 成功的枚举和对应的结果
 */
export type FResult<
	T extends symbol,
	O extends readonly [result: T, data?: any],
> = Exclude<T, O[0]> | O;

/**异步函数的结果 */
export type AFResult<
	T extends symbol,
	O extends readonly [result: T, data?: any],
> = Promise<FResult<T, O>>;

/**
 * 成功并携带数据
 * @param data 数据
 * @param result 结果，留空就 Result.Ok
 */
export function withData<
	T,
	R extends symbol = ResultOk,
>(data: T, result?: R): [R, T] {
	return [result ?? ResultOk.Ok as any, data];
}

/**
 * 成功
 * @param result 结果，留空就 Result.Ok
 */
export function justOk<R extends symbol = ResultOk>(result?: R): [R] {
	return [result ?? ResultOk.Ok as any];
}

export function typeOf<R extends symbol | [symbol, any?]>(n: R):
R extends [symbol, any?] ? R[0] : R {
	return typeof n === 'symbol' ? n as any : n[0] as any;
}

/**
 * 如果这个能编译过，说明
 *
 * - `./results.ts` 确实只包含了枚举定义且顶层没有单独的 symbol
 * - `Result` 确实包含了所有枚举
 */
export const marked: Enumified<typeof results> extends Result
	? true
	: false = mark(results);

