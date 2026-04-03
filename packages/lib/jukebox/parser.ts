/**
 * 弹幕解析器
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/jukebox/parser';

import { getPicker, Player, Song } from 'lib/player';
import { Reader } from 'lib/reader';
import { Danmaku, Enumified, mark, Picker } from 'lib/types';
import { Eventer } from 'lib/util';

/**命令类型 */
export type Command = Enumified<typeof Command>;
export namespace Command {
	/**可能不是命令吧 */
	export const Idk = Symbol();
	/**点一首歌 */
	export const Song = Symbol();
	/**取消 */
	export const Cancel = Symbol();
	mark({ Command });
}

/**解析出的事件的表 */
export interface ParserEvent {
	/**不是命令 */
	[Command.Idk]: Danmaku;
	/**来歌曲了 */
	[Command.Song]: Song | Danmaku;
	/**有人取消歌曲了 */
	[Command.Cancel]: Picker;
}
/**分辨弹幕属于哪种命令 */
export type Distinguisher = (danmaku: Danmaku) => Command;
/**分辨中文弹幕命令 */
export function DistinguishChinese({ message }: Danmaku): Command {
	if (message.startsWith('点歌 ')) return Command.Song;
	if (message === '取消') return Command.Cancel;
	return Command.Idk;
}

/**命令类型对应的解析函数 */
type ParserMap = { [I in Command]: (danmaku: Danmaku) => Promise<ParserEvent[I]> };
/**弹幕解析器 */
export class Parser extends Eventer<ParserEvent> implements ParserMap {
	constructor(
		/**弹幕读取器 */
		protected readonly readers: readonly Reader[],
		/**弹幕读取器 */
		protected readonly players: readonly Player[],
		/**分辨弹幕属于哪种命令 */
		protected readonly distinguisher: Distinguisher,
	) {
		super();
		for (const reader of readers) {
			reader.addListener('danmaku', n => this.parse(n));
		}
	}

	/**
	 * 分析弹幕，并以事件的形式派发给自己的监听器
	 * @param danmaku 弹幕
	 */
	async parse(this: this, danmaku: Danmaku) {
		danmaku = {
			...danmaku,
			message: danmaku.message.trim(),
		};
		const type = this.distinguisher(danmaku);
		this.dispatch(type, await this[type](danmaku));
	}
	async [Command.Idk](danmaku: Danmaku) {
		return danmaku;
	}
	async [Command.Song](danmaku: Danmaku) {
		for (const player of this.players) {
			const parsed = await player.parse(danmaku);
			if (parsed) return parsed;
		}
		return danmaku;
	}
	async [Command.Cancel](danmaku: Danmaku) {
		return getPicker(danmaku);
	}
}

