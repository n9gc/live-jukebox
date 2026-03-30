/**
 * 操作结果的表示相关
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/result';

import { ResultOk } from 'lib/result/results';

export * from './results';

/**判断 `n` 是不是成功的操作 */
export function isOk<T>(n: T | symbol): n is ResultOk | Exclude<T, symbol> {
	return typeof n !== 'symbol' || n === ResultOk.Ok;
}

/**判断 `n` 是不是失败的操作 */
export function isNotOk<T>(n: T | symbol): n is Exclude<T extends symbol ? T : never, ResultOk> {
	return typeof n === 'symbol' && n !== ResultOk.Ok;
}

/**把 N 的内容物作为联合类型 */
type ValueOf<N> = N[keyof N];
/**得到枚举对象或者嵌套了枚举对象的枚举对象的枚举类型 */
export type Enumified<T> = (T extends symbol
	? T
	: ValueOf<{ [I in keyof T]: Enumified<T[I]> }>
);

