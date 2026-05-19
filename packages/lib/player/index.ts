/**
 * 播放器相关
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/player';

export { default as Player } from './player';

import { BaseSong, Danmaku, Picker } from 'lib/types';
import type * as z from 'zod';
import Player, { registered } from './player';

/**基本的信息结构 */
export interface Song<K extends string = string, S extends z.ZodType = z.ZodType> extends BaseSong {
	readonly playerName: K;
	readonly info: z.infer<S>;
}

/**获得点歌人名 */
export function getPicker({ uname, face, readerName }: Danmaku): Picker {
	return Picker.parse(`${readerName}:[${uname.trim()}]@${face.trim()}`);
}

/**
 * 注册播放器的方法
 * @param name 播放器注册的名字
 * @param schema 播放器信息的 schema
 * @deprecated 不需要注册了先
 */
export function registerPlayer<
	K extends string,
	S extends z.ZodType,
	A extends any[],
>(
	name: K,
	schema: S,
	player: new (...parameters: A) => Omit<Player<K, S>, 'registered' | 'playerName' | 'infoSchema'>,
): new (...parameters: A) => Player<K, S> {
	class Registered extends player {
		readonly registered: typeof registered = registered;
		readonly playerName = name;
		readonly infoSchema = schema;
	}
	return Registered;
}

