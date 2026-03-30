/**
 * 播放器
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/player/Player';

import { Danmaku, Song } from 'lib/types';
import { JSX } from 'react';

/**播放器 */
export default abstract class Player<
	K extends keyof PlayerInfoMap = keyof PlayerInfoMap,
> {
	/**播放器注册的名字 */
	abstract readonly name: K;
	/**点歌的简单教学 */
	abstract readonly desc: string;
	/**解析去掉开头“点歌 ”的弹幕为播放信息，若无法解析就返回 null */
	abstract parse(damaku: Danmaku): Promise<PlayerInfoMap[K] | null>;
	/**用于播放的元素 */
	abstract PlayEle(info: PlayerInfoMap[K]): JSX.Element;
	/**显示在列表的元素 */
	TitleEle(info: PlayerInfoMap[K]): JSX.Element {
		const song: Song = info;
		return <div>{song.title}</div>;
	}
}

