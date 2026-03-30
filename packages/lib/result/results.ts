/**
 * 具体的操作结果定义
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/result/results';

import { Enumified } from 'lib/result';

/**成功的结果 */
export type ResultOk = Enumified<typeof ResultOk>;
export namespace ResultOk {
	/**成功 */
	export const Ok = Symbol();
}

/**备选点歌器的结果 */
export type ResultPick = Enumified<typeof ResultPick>;
export namespace ResultPick {
	/**歌单里没歌 */
	export const NoMusic = Symbol();
	/**歌单放完了 */
	export const End = Symbol();
}

/**点歌历史类的结果 */
export type ResultOperaMap = Enumified<typeof ResultOperaMap>;
export namespace ResultOperaMap {
	export import Ok = ResultOk.Ok;
	/**找不到用户的点歌记录 */
	export const NoOperation = Symbol();
	/**播放已经开始 */
	export const ErasingRan = Symbol();
}

/**所有操作的结果 */
export type Result = Enumified<typeof Result>;
export const Result = {
	ResultOk,
	ResultOperaMap,
	ResultPick,
};

