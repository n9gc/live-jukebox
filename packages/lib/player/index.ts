/**
 * 播放器相关
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/player';

export { default as Player } from './Player';

import Player, { registered } from './Player';
import { BaseSong, Danmaku, Picker } from 'lib/types';
import * as z from 'zod';

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
		readonly registered: typeof registered = registered;
		readonly playerName = name;
		readonly infoSchema = schema;
	}
	return Base;
}

