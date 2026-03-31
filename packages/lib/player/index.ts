/**
 * 播放器相关
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/player';

export { default as Player } from './Player';
export * from './info';

import { Danmaku } from 'lib/types';
import Player, { registered } from './Player';
import { PlayerName, playerNames } from './info';

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

/**
 * 方便地获得播放器的基类并注册
 * @param name 播放器注册的名字
 */
export function RegisteredPlayer<K extends PlayerName>(name: K) {
	playerNames.add(name);
	abstract class Base extends Player<K> {
		protected readonly registered: typeof registered = registered;
		readonly playerName = name;
	}
	return Base;
}

