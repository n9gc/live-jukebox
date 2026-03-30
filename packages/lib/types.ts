/**
 * 大部分需要验证的类型
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/types';

export * from 'lib/dist/types-schema';

/**弹幕 */
export interface Danmaku {
	/**毫秒时间戳 */
	readonly timestamp: number;
	/**弹幕内容 */
	readonly message: string;
	/**用户名 */
	readonly uname: string;
	/**用户头像URL */
	readonly face: string;
	/**是否忽略这条弹幕 */
	readonly ignore: boolean;
}
