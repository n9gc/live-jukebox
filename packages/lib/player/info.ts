/**
 * 播放器信息相关定义
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/player/info';

import { BaseSong } from 'lib/types';

declare global {
	/**每个播放器定义自己所需信息结构的表 */
	interface PlayerInfoMap { }
}

/**播放器名字 */
export type PlayerName = keyof PlayerInfoMap;

/**基本的信息结构 */
export interface Song<K extends PlayerName> extends BaseSong {
	/**播放器名称 */
	readonly playerName: K;
	/**歌曲携带的播放器特定信息 */
	readonly data: PlayerInfoMap[K];
}

