/**
 * 具体的操作结果定义
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/result/results';

import type { Enumified } from 'lib/result';

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
	/**找不到用户的点歌记录 */
	export const NoOperation = Symbol();
	/**播放已经开始 */
	export const ErasingRan = Symbol();
}

/**歌曲列表切换下一首歌的结果 */
export type ResultListNext = Enumified<typeof ResultListNext>;
export namespace ResultListNext {
	/**播完的不是头上的歌 */
	export const NotHead = Symbol();
	/**播完的歌不存在 */
	export const NotExist = Symbol();
	export import Ok = ResultOk;
	export import OperaMap = ResultOperaMap;
}

/**所有操作的结果 */
export type Result = Enumified<typeof Result>;
export const Result = {
	ResultOk,
	ResultOperaMap,
	ResultPick,
	ResultListNext,
};
export default Result;

