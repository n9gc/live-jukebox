/**
 * b 站曲目信息定义
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module './info';

declare global {
	interface PlayerInfoMap {
		/**B 站视频 */
		bili: BiliInfo;
	}
}
/**B 站视频信息 */
export interface BiliInfo {
	/**BV 号 */
	bvid: string;
	/**第几 p */
	page: number;
}

