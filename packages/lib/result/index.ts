/**
 * 操作结果的表示相关
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/result';

export * from './results';

import { ResultOk } from 'lib/result/results';
import { Enumified, mark } from 'lib/util';
import Result, * as results from './results';

/**判断 `n` 是不是成功的操作 */
export function isOk<T>(n: T | symbol): n is ResultOk | Exclude<T, symbol> {
	return typeof n !== 'symbol' || n === ResultOk.Ok;
}

/**判断 `n` 是不是失败的操作 */
export function isNotOk<T>(n: T | symbol): n is Exclude<T extends symbol ? T : never, ResultOk> {
	return typeof n === 'symbol' && n !== ResultOk.Ok;
}

/**
 * 如果这个能编译过，说明
 *
 * - `./results.ts` 确实只包含了枚举定义且顶层没有单独的 symbol
 * - `Result` 确实包含了所有枚举
 */
export const marked: (Enumified<typeof results> extends Result
	? true
	: false
) = mark(results);

