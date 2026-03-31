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

/**歌曲列表切换下一首歌的结果 */
export type ResultListEnd = Enumified<typeof ResultListEnd>;
export namespace ResultListEnd {
	/**已经被结束过了 */
	export const EndBefore = Symbol();
	/**歌单里没有歌 */
	export const NotExist = Symbol();
	/**还没开始就停止了 */
	export const NotPlayed = Symbol();
	export import Ok = ResultOk;
}

/**歌曲列表添加歌曲的结果 */
export type ResultListAdd = Enumified<typeof ResultListAdd>;
export namespace ResultListAdd {
	/**重复添加歌曲 */
	export const SameId = Symbol();
	/**谁家没播放器的曲子 */
	export const UnknownPlayer = Symbol();
	export import Ok = ResultOk;
}

/**歌曲列表取消播放的结果 */
export type ResultListCancel = Enumified<typeof ResultListCancel>;
export namespace ResultListCancel {
	/**没有可以取消的歌 */
	export const NoCancelable = Symbol();
	/**要被取消的歌还在放 */
	export const Playing = Symbol();
	export import Ok = ResultOk;
}

/**所有操作的结果 */
export type Result = Enumified<typeof Result>;
export const Result = {
	ResultOk,
	ResultPick,
	ResultListEnd,
	ResultListAdd,
	ResultListCancel,
};
export default Result;

