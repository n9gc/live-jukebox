/**
 * 纯 ts 类型，要被编译成 zod schema
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/types/pure';

import * as Schema from 'lib/dist/types-schema';
import type { getId } from 'lib/util';

/**弹幕 */
export const Danmaku = Schema.Danmaku;
export interface Danmaku {
	/**毫秒时间戳 */
	readonly timestamp: number;
	/**弹幕内容 */
	readonly message: string;
	/**用户名 */
	readonly uname: string;
	/**用户头像URL */
	readonly face: string;
	/**是否忽略这条弹幕 */
	readonly ignore: boolean;
}

/**点歌的人，如果是备选歌单则为 `null` */
export type Picker = string | null;
export const Picker = Schema.Picker;

/**
 * 标记歌的代码
 * @schema templateLiteral(['song:', z.bigint()]).brand('SongId')
 */
export type SongId = ReturnType<typeof getId>;
export const SongId = Schema.SongId;

/**
 * 歌曲信息
 *
 * 不要相信对象引用，使用 id 来比较两个歌曲是否相同
 * @schema .readonly()
 */
export const BaseSong = Schema.BaseSong;
export interface BaseSong {
	/**唯一标记一首歌的代码 */
	readonly id: SongId;
	/**歌曲标题 */
	readonly title: string;
	/**播放器名称 */
	readonly playerName: string;
	/**歌曲携带的播放器特定信息 */
	readonly info: unknown;
	/**点歌的人 */
	readonly picker: Picker;
}

/**单一模块文件的多语言函数 */
export type FlatTranslationFunctions = Record<string, (...parameters: any[]) => any>;
export const FlatTranslationFunctions = Schema.TranslationObject;
