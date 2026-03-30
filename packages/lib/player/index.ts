/**
 * 对播放器的定义
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module '.';

import { Danmaku, Song } from 'lib/types';
import { JSX } from 'react';

declare global {
	/**每个播放器定义自己所需 Info 结构的表 */
	interface PlayerInfoMap { }
}

/**基本的 Info 结构 */
export interface Info extends Song {
	/**播放器 */
	readonly playerType: keyof PlayerInfoMap;
}
/**如果它能编译过，说明 Info 表的类型正确 */
export const checker: Info = {} as PlayerInfoMap[keyof PlayerInfoMap];

/**
 * 检查评论是不是点歌弹幕
 * @returns 如果是则返回去掉开头“点歌 ”内容的弹幕，否则为 `null`
 */
export function fmtPlayCmd(danmaku: Danmaku): Danmaku | null {
	const message = danmaku.message.trim();
	return message.startsWith('点歌 ')
		? {
			...danmaku,
			message: message.slice(3),
		}
		: null;
}

/**播放器 */
export abstract class Player<K extends keyof PlayerInfoMap> {
	/**播放器注册的名字 */
	abstract readonly name: K;
	/**点歌的简单教学 */
	abstract readonly desc: string;
	/**解析去掉开头“点歌 ”的弹幕为播放信息，若无法解析就返回 null */
	abstract parse(damaku: Danmaku): Promise<PlayerInfoMap[K] | null>;
	/**用于播放的元素 */
	abstract PlayEle(info: PlayerInfoMap[K]): JSX.Element;
	/**显示在列表的元素 */
	abstract titleEle(info: PlayerInfoMap[K]): JSX.Element;
}

