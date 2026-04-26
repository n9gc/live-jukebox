/**
 * 枚举部分
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/types/enum';

import { initLogger } from 'lib/util';
import * as z from 'zod';

const { logger, thr } = initLogger(['types', 'enum']);

/**把 N 的内容物作为联合类型 */
type ValueOf<N> = N[keyof N];
/**强制让 T 变成联合对象的形式 */
type UnionForced<T> = T extends T ? T : never;
/**类型没有限制的实现 */
type EnumifiedImpl<T extends Enum | symbol> = T extends Enum
	? UnionForced<ValueOf<{ [I in keyof T]: EnumifiedImpl<T[I]> }>>
	: T;
/**约束类型 */
type Asserted<A, B> = A extends B ? A : never;
/**得到枚举对象或者嵌套了枚举对象的枚举对象的枚举类型 */
export type Enumified<T extends Enum> = Asserted<EnumifiedImpl<T>, symbol>;
/**枚举对象 */
export interface Enum extends Readonly<Record<string, Enum | symbol>> { }

/**全局所有标记名称定义的位置 */
const definedMap = new Map<symbol, Error>();
/**全局所有被标记过的枚举对应的标记 */
const markedMap = new WeakMap<symbol, symbol>();
/**
 * 给所有 symbol 打上标记
 * @param enums 导出枚举的模块
 */
export function mark(enums: Record<string, Enum>): true {
	for (const name of Object.keys(enums).toReversed()) {
		const enumObject = enums[name];
		logger.trace('marking {name}', { enumObj: enumObject, name });
		for (const key of Object.keys(enumObject)) {
			const oriSym = enumObject[key];
			if (typeof oriSym !== 'symbol') continue;
			let sym = markedMap.get(oriSym);
			if (!sym) {
				sym = Symbol.for(`${name}.${key}`);
				if (definedMap.get(sym)) {
					thr('double defined {sym} in {defPos}', { sym, defPos: definedMap.get(sym) });
				}
				definedMap.set(sym, new Error('defined here'));
				markedMap.set(oriSym, sym);
			}
			logger.trace('{name}.{key} is {sym}', { sym, key, name });
			// @ts-ignore
			enumObject[key] = sym;
		}
	}
	return true;
}

/**
 * 获取一个枚举所有的成员
 * @param enumObject 枚举对象
 * @returns 集合里装着各个成员
 */
export function getVariants<T extends Enum>(enumObject: T, r = new Set<symbol>()): Set<Enumified<T>> {
	for (const key of Object.keys(enumObject)) {
		const child = enumObject[key];
		if (typeof child === 'symbol') {
			r.add(child);
		} else {
			getVariants(child, r);
		}
	}
	return r as any;
}

/**获得一个 Symbol 的 zod schema */
export function getSymbolSchema<T extends symbol>(sym: T): z.ZodCustom<T, T> {
	return z.custom<T>(
		n => n === sym,
		{ error: `is not ${sym.toString()}` },
	);
}

/**给联合类型的每个类型套一个 ZodCustom 之后放到一个 ZodUnion 里 */
type SchemaUnion<T> = z.ZodUnion<readonly (T extends T ? z.ZodCustom<T, T> : never)[]>;
/**
 * 得到一个枚举对象的联合 Schema
 * @param enumObject 枚举对象
 * @returns Schema 的联合类型
 */
export function getEnumSchema<T extends Enum>(enumObject: T): SchemaUnion<Enumified<T>> {
	return z.union(
		[...getVariants(enumObject)].map(n => getSymbolSchema(n)),
	) as any;
}

/**
 * 给一个 symbol 实现 Codec ，通过 Symbol.for 实现
 * @param sym 通过 Symbol.for 产生的 symbol ，比如被 mark 过的枚举
 */
export function getSymbolCodec<T extends symbol>(sym: T): z.ZodCodec<z.ZodString, z.ZodCustom<T, T>> {
	const oriKey = Symbol.keyFor(sym)
		?? thr('The {sym} is not a symbol got by `Symbol.for`', { sym });
	return z.codec(z.string(), getSymbolSchema(sym), {
		encode: () => oriKey,
		decode(key, context) {
			if (key === oriKey) return sym;
			context.issues.push({
				code: 'invalid_value',
				input: key,
				values: [oriKey],
			});
			return z.NEVER;
		},
	});
}

/**给联合类型的每个类型套一个 codec 之后放到一个 ZodUnion 里 */
type CodecUnion<T> = z.ZodUnion<readonly (T extends T ? z.ZodCodec<z.ZodString, z.ZodCustom<T, T>> : never)[]>;
/**
 * 得到一个枚举对象的联合 Codec
 * @param enumObject 枚举对象
 * @returns Codec 的联合类型的 Schema
 */
export function getEnumCodec<T extends Enum>(enumObject: T): CodecUnion<Enumified<T>> {
	return z.union(
		[...getVariants(enumObject)].map(n => getSymbolCodec(n)),
	) as any;
}

