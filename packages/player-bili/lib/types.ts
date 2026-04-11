/**
 * b 站曲目信息定义
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module './types';

import * as Schema from '../dist/types-schema';

/**
 * B 站视频信息
 * @schema .readonly()
 */
export interface BiliInfo {
	/**BV 号 */
	readonly bvid: string;
	/**第几 p */
	readonly page: number;
}
export const BiliInfo = Schema.BiliInfo;

