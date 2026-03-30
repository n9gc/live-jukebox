/**
 * 播放器相关
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/player';

import { Danmaku } from 'lib/types';

export * from './info';
export { default as Player } from './Player';

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

