/**
 * 枚举部分
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/util/enum';

import { thr } from 'lib/util';

/**把 N 的内容物作为联合类型 */
type ValueOf<N> = N[keyof N];
/**强制让 T 变成联合对象的形式 */
type UnionForced<T> = T extends T ? T : never;
/**类型没有限制 */
type EnumifiedImpl<T extends Enum | symbol> = (T extends Enum
	? UnionForced<ValueOf<{ [I in keyof T]: EnumifiedImpl<T[I]> }>>
	: T
);
/**得到枚举对象或者嵌套了枚举对象的枚举对象的枚举类型 */
export type Enumified<T extends Enum> = EnumifiedImpl<T>;
/**枚举对象 */
export interface Enum extends Readonly<Record<string, Enum | symbol>> { }

/**放着全局所有 enum 定义的位置 */
const symbolMap = new Map<string, Error>();
/**
 * 给所有 symbol 打上方便调试的标记
 * @param enums 导出枚举的模块
 */
export function mark(enums: Record<string, Enum>): true {
	const mem = new WeakMap<symbol, symbol>();
	for (const name of Object.keys(enums).reverse()) {
		const space = enums[name];
		for (const key of Object.keys(space)) {
			const obj = space[key];
			if (typeof obj !== 'symbol') continue;
			let sym = mem.get(obj);
			if (!sym) {
				const symName = `${name}.${key}`;
				const lastDef = symbolMap.get(symName);
				if (lastDef) thr('枚举重名', lastDef);
				symbolMap.set(symName, Error());
				sym = Symbol.for(symName);
				mem.set(obj, sym);
			}
			// @ts-ignore
			space[key] = sym;
		}
	}
	return true;
}

/**
 * 获取一个枚举所有的成员
 * @param enumObj 枚举对象
 * @returns 集合里装着各个成员
 */
export function getVariants<T extends Enum>(enumObj: T, r = new Set<symbol>()): Set<Enumified<T>> {
	for (const key of Object.keys(enumObj)) {
		const obj = enumObj[key];
		if (typeof obj === 'symbol') {
			r.add(obj);
		} else {
			getVariants(obj, r);
		}
	}
	return r as any;
}

