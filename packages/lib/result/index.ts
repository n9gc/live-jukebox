/**
 * 操作结果的表示相关
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/result';

import { ResultOk } from 'lib/result/results';
import { thr } from 'lib/util';
import Result, * as results from './results';

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
/**类型没有限制 */
type EnumifiedImpl<T extends Enum | symbol> = (T extends Enum
	? ValueOf<{ [I in keyof T]: EnumifiedImpl<T[I]> }>
	: T
);
/**得到枚举对象或者嵌套了枚举对象的枚举对象的枚举类型 */
export type Enumified<T extends Enum> = EnumifiedImpl<T>;
/**枚举对象 */
export interface Enum extends Readonly<Record<string, Enum | symbol>> { }

/**
 * 给所有 symbol 打上方便调试的标记
 * @param results 导出枚举的模块
 */
export function mark(results: Enum): true {
	const mem = new WeakMap<symbol, symbol>();
	for (const name of Object.keys(results).reverse()) {
		const space = results[name];
		if (typeof space === 'symbol') thr('不要在 results 顶层声明一个单独的 symbol', name, space);
		for (const key of Object.keys(space)) {
			const obj = space[key];
			if (typeof obj !== 'symbol') continue;
			let sym = mem.get(obj);
			if (!sym) {
				sym = Symbol(`${name}.${key}`);
				mem.set(obj, sym);
			}
			// @ts-ignore
			space[key] = sym;
		}
	}
	return true;
}

/**
 * 如果这个能编译过，说明
 *
 * - `./results.ts` 确实只包含了枚举定义
 * - `Result` 确实包含了所有枚举
 */
export const marked: (Enumified<typeof results> extends Result
	? true
	: false
) = mark(results);

