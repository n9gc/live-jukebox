/**
 * 工具类型
 * @license MIT
 * @author n9gc
 */
declare module 'tape-i18n/types/utility';

/**把联合类型 T 变成交叉类型 */
export type Intersected<T> = (T extends T ? (n: T) => never : never) extends ((n: infer I) => never) ? I : never;

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

/**集成了抽象类的普通类 */
export type Deabstracted<
	T extends abstract new (...parameters: any[]) => unknown,
> = T extends abstract new (...parameters: infer P) => infer I
	? new (...parameters: P) => I
	: never;

