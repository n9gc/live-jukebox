/**
 * 手动定义的类型
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/types/defines';

import * as z from 'zod';

/**
 * 得到一个类型的 json codec
 * @param schema 类型的 schema
 */
export function getJsonCodec<T extends z.ZodType>(schema: T) {
	return z.codec(z.string(), schema, {
		decode(input, context) {
			try {
				return JSON.parse(input);
			} catch (error) {
				const message = error instanceof Error ? error.message : '';
				context.issues.push({
					code: 'invalid_format',
					format: 'json',
					input,
					message,
				});
				return z.NEVER;
			}
		},
		encode(value) {
			return JSON.stringify(value);
		},
	});
}

/**把 N 的内容物作为联合类型 */
export type ValueOf<N> = N[keyof N];

/**强制让 T 变成联合对象的形式 */
export type UnionForced<T> = T extends T ? T : never;

/**约束类型 */
export type Asserted<A, B> = A extends B ? A : never;

/**可以得到路径的对象 */
export interface Pathable<T> {
	[k: string]: Pathable<T> | T;
}
/**深入得到对象的路径 */
type PathsOfImpl<
	S extends string,
	T,
	M extends Pathable<T>,
	K extends keyof M & string,
> = K extends K
	? (M[K] extends Pathable<T>
		? `${K}${S}${PathsOfImpl<S, T, M[K], Asserted<keyof M[K], string>>}`
		: K
	)
	: never;
/**
 * 得到通向对象的路径
 * 比如
 * ```typescript
 * type A = {
 *   a: {
 *     b: {
 *       c: {
 *         d: 123;
 *       };
 *     };
 *   };
 * };
 *
 * // 'a.b.c'
 * type B = PathsOf<A, Record<string, number>>;
 *
 * // 'a/b/c/d'
 * type C = PathsOf<A, number, '/'>;
 * ```
 */
export type PathsOf<
	M extends Pathable<T>,
	T,
	S extends string = '.',
> = PathsOfImpl<S, T, M, Asserted<keyof M, string>>;

/**深入访问对象 */
type VisitedImpl<
	S extends string,
	P extends string,
	M,
> = P extends `${infer K}${S}${infer P}`
	? (K extends keyof M
		? VisitedImpl<S, P, M[K]>
		: never
	)
	: (P extends keyof M
		? M[P]
		: never
	);
/**
 * 通过路径访问对象
 * 比如
 * ```typescript
 * type A = {
 *   a: {
 *     b: {
 *       c: {
 *         d: 123;
 *       };
 *     };
 *   };
 * };
 *
 * // { d: 123 }
 * type B = Visited<A, 'a.b.c'>;
 *
 * // 123
 * type B = Visited<A, 'a/b/c/d', '/'>;
 * ```
 */
export type Visited<
	M,
	P extends string,
	S extends string = '.',
> = VisitedImpl<S, P, M>;

