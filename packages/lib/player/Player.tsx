/**
 * 播放器
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/player/Player';

import { PlayerName, Song } from 'lib/player/info';
import { Danmaku } from 'lib/types';
import { JSX } from 'react';

/**播放器 */
export default abstract class Player<
	K extends PlayerName = PlayerName,
> {
	/**播放器注册的名字 */
	abstract readonly playerName: K;
	/**点歌的简单教学 */
	abstract readonly desc: string;
	/**解析去掉开头“点歌 ”的弹幕为播放信息，若无法解析就返回 null */
	abstract parse(damaku: Danmaku): Promise<Song<K> | null>;
	/**用于播放的元素 */
	abstract PlayEle(info: Song<K>): JSX.Element;
	/**显示在列表的元素 */
	TitleEle(song: Song<K>): JSX.Element {
		return <div>{song.title}</div>;
	}
}

