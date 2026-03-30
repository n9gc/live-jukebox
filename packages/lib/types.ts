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

/**点歌的人，如果是备选歌单则为 `null` */
export type Picker = string | null;

/**歌曲信息 */
export interface BaseSong {
	/**歌曲标题 */
	readonly title: string;
	/**播放器名称 */
	readonly playerName: string;
	/**歌曲携带的播放器特定信息 */
	readonly info: unknown;
	/**点歌的人 */
	readonly picker: Picker;
	/**是否已经开始播放过 */
	ran: boolean;
}
