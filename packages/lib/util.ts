/**
 * 实用函数
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/util';

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

/**操作的结果 */
export const enum Result {
	/**操作成功 */
	Ok,
	/**备选点歌时，歌单里没歌 */
	PickNoMusic,
	/**备选点歌时，歌单放完了 */
	PickEnd,
	/**取消点歌时，找不到用户的点歌记录 */
	EraseNoOperation,
	/**取消点歌时，播放已经开始 */
	EraseErasingRan,
}
/**判断 `n` 是不是操作的结果 */
export function isResult<T>(n: T | number): n is number {
	return typeof n === 'number';
}

