/**
 * 播放器
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module './player';

import { Song } from 'lib/player';
import { Danmaku } from 'lib/types';
import { JSX } from 'react';
import * as z from 'zod';

/**被注册过 */
export const registered = Symbol();

/**
 * 播放器
 *
 * 不要直接继承这个类，而是像这样
 *
 * ```ts
 * class MyPlayer extends RegisteredPlayer('my') {
 *     // ...
 * }
 * ```
 *
 * 即可在声明时就注册你的播放器
 */
export default abstract class Player<
	K extends string = string,
	S extends z.ZodType = z.ZodType,
> {
	/**被注册过 */
	abstract readonly registered: typeof registered;
	/**播放器注册的名字 */
	abstract readonly playerName: K;
	/**点歌的简单教学 */
	abstract readonly desc: string;
	/**歌曲额外信息的 zod schema */
	abstract readonly infoSchema: S;
	/**解析去掉开头“点歌 ”的弹幕为播放信息，若无法解析就返回 undefined */
	abstract parse(this: this, danmaku: Danmaku): Promise<Song<K, S> | undefined>;
	/**用于播放的元素 */
	abstract PlayEle(info: Song<K, S>): JSX.Element;
	/**显示在列表的元素 */
	TitleEle(song: Song<K, S>): JSX.Element {
		return <div>{song.title}</div>;
	}
}

