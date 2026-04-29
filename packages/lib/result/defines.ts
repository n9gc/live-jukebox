/**
 * 一些类型定义
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/result/defines';

import { FResult } from 'lib/result';
import {
	CustomCodec,
	Enum,
	Enumified,
	getJsonCodec,
	getSymbolCodec,
	getSymbolSchema,
	getVariants,
} from 'lib/types';
import * as z from 'zod';

/**
 * 对于联合类型 T 的各个类型，根据是 symbol 还是 [symbol, Schema] 做不同处理
 * 最后放到一个 ZodUnion 里
 */
type FResultVariantSchemaUnion<T> = z.ZodUnion<(T extends T
	? (T extends readonly [infer S, infer Z extends z.ZodType]
		? z.ZodTuple<[z.ZodCustom<S>, Z], null>
		: z.ZodCustom<T, T>
	) : never
)[]>;
/**
 * 获得一个 FResult 的 Schema
 * @param enumObject 可能的枚举
 * @param dataStatus 枚举成功的情况
 */
export function getFResultSchema<
	const E extends Enum,
	const O extends readonly [Enumified<E>, z.ZodType][],
>(enumObject: E, dataStatus: O):
FResultVariantSchemaUnion<FResult<Enumified<E>, O[number]>> {
	const variants: z.ZodType[] = [];
	const enums = getVariants(enumObject);
	for (const [sym, schema] of dataStatus) {
		enums.delete(sym);
		variants.push(z.tuple([getSymbolSchema(sym), schema]));
	}
	for (const sym of enums) {
		variants.push(getSymbolSchema(sym));
	}
	return z.union(variants) as any;
}

/**
 * 对于联合类型 T 的各个类型，根据是 symbol 还是 [symbol, Codec] 做不同处理
 * 最后放到一个 ZodUnion 里
 */
type FResultVariantCodecUnion<T> = z.ZodUnion<(T extends T
	? (T extends readonly [infer S, infer Z extends z.ZodCodec<z.ZodString>]
		? z.ZodCodec<z.ZodString, z.ZodTuple<[CustomCodec<S>, Z], null>>
		: CustomCodec<T>
	) : never
)[]>;
/**
 * 获得一个 FResult 的 Codec
 * @param enumObject 可能的枚举
 * @param dataStatus 枚举成功的情况
 */
export function getFResultCodec<
	const E extends Enum,
	const O extends readonly [Enumified<E>, z.ZodCodec<z.ZodString>][],
>(enumObject: E, dataStatus: O):
FResultVariantCodecUnion<FResult<Enumified<E>, O[number]>> {
	const variants: z.ZodCodec<z.ZodString>[] = [];
	const enums = getVariants(enumObject);
	for (const [sym, codec] of dataStatus) {
		enums.delete(sym);
		variants.push(getJsonCodec(z.tuple([getSymbolCodec(sym), codec])));
	}
	for (const sym of enums) {
		variants.push(getSymbolCodec(sym));
	}
	return z.union(variants) as any;
}

