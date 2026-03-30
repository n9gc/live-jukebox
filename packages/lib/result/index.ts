/**
 * 操作结果的表示相关
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/result';

export * from './results';

/**判断 `n` 是不是操作的结果 */
export function isResult<T>(n: T | symbol): n is symbol {
	return typeof n === 'symbol';
}

/**把 N 的内容物作为联合类型 */
type ValueOf<N> = N[keyof N];
/**得到枚举对象或者嵌套了枚举对象的枚举对象的枚举类型 */
export type Enumified<T> = (T extends symbol
	? T
	: ValueOf<{ [I in keyof T]: Enumified<T[I]> }>
);

