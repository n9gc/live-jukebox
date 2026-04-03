/**
 * 播放器相关
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/player';

export { default as Player } from './Player';

import Player, { registered } from 'lib/player/Player';
import { BaseSong, Danmaku, Picker } from 'lib/types';
import z from 'zod';

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

/**基本的信息结构 */
export interface Song<K extends string = string, S extends z.ZodType = z.ZodType> extends BaseSong {
	readonly playerName: K;
	readonly info: z.infer<S>;
}

/**获得点歌人名 */
export function getPicker({ uname, face }: Danmaku): Picker {
	return `${uname.trim()}:${face.trim()}`;
}

/**
 * 方便地获得播放器的基类并注册
 * @param name 播放器注册的名字
 */
export function RegisteredPlayer<K extends string, S extends z.ZodType>(name: K, schema: S) {
	abstract class Base extends Player<K, S> {
		protected readonly registered: typeof registered = registered;
		readonly playerName = name;
		readonly infoSchema = schema;
	}
	return Base;
}

