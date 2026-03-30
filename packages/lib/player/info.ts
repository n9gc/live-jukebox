/**
 * 播放器信息相关定义
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/player/info';

import { Song } from 'lib/types';

declare global {
	/**每个播放器定义自己所需信息结构的表 */
	interface PlayerInfoMap { }
}

/**基本的信息结构 */
export interface Info extends Song {
	/**播放器名称 */
	readonly playerType: keyof PlayerInfoMap;
}
/**如果它能编译过，说明 Info 表的类型正确 */
export const checker: Info = {} as PlayerInfoMap[keyof PlayerInfoMap];

