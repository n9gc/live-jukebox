/**
 * 实用函数
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/util';

export * from './config';
export * from './Eventer';
export { default as Eventer } from './Eventer';

/**
 * 安全调用函数
 * @param fn 可能抛出错误的函数
 * @param ext 用来说亡语的函数
 */
export function run<T>(fn: () => T, ext: (error: unknown) => void | Error): T {
	try {
		return fn();
	} catch (error) {
		throw ext(error) ?? error;
	}
}

/**方便地抛出错误 */
export function thr(why: string, ...params: unknown[]): never {
	throw Error(why, { cause: params });
}

/**全局 id */
let id = 0n;
/**获得一个全局 id */
export function getId(): bigint {
	return id++;
}

