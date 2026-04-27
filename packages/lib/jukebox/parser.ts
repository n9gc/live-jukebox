/**
 * 弹幕解析器
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/jukebox/parser';

import { getLL } from 'lib/i18n';
import { getPicker, Player, Song } from 'lib/player';
import { Reader } from 'lib/reader';
import { Danmaku, Enumified, mark, Picker } from 'lib/types';
import { Eventer, initLogger } from 'lib/util';

/**弹幕解析器的日志器 */
const { logger } = initLogger(['jukebox', 'parser']);
const LL = getLL().jukebox.parser;

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
	[Command.Idk]: {
		/**之前被解析的命令 */
		readonly previous: Command;
		/**原弹幕 */
		readonly danmaku: Danmaku;
	};
	/**来歌曲了 */
	[Command.Song]: Song;
	/**有人取消歌曲了 */
	[Command.Cancel]: Picker;
}
/**分辨弹幕属于哪种命令 */
export type Distinguisher = (danmaku: Danmaku) => [Command, Danmaku?];
/**分辨中文弹幕命令 */
export function distinguishChinese(danmaku: Danmaku): [Command, Danmaku?] {
	const { message } = danmaku;
	if (message === '取消') return [Command.Cancel];
	if (message.startsWith('点歌 ')) {
		return [
			Command.Song,
			{
				...danmaku,
				message: message.slice(3),
			},
		];
	}
	return [Command.Idk];
}

/**命令类型对应的解析函数 */
type ParserMap = {
	[I in Command]: (danmaku: Danmaku) => Promise<ParserEvent[I] | typeof Command.Idk>;
};
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
			reader.addListener('danmaku', n => {
				logger.info(LL.someoneSaid(n));
				this.parse(n);
			});
		}
	}

	/**
	 * 分析弹幕，并以事件的形式派发给自己的监听器
	 * @param danmaku 弹幕
	 */
	parse(this: this, danmaku: Danmaku) {
		danmaku = {
			...danmaku,
			message: danmaku.message.trim(),
		};
		const r = this.distinguisher(danmaku);
		const [type, danmakuDised = danmaku] = r;
		this[type](danmakuDised).then(parsed => {
			if (parsed === Command.Idk) {
				const idkObject = { previous: type, danmaku } as const;
				logger.warn(LL.parseFailed({ message: danmaku.message, previous: type }));
				this.dispatch(Command.Idk, idkObject);
				return;
			}
			logger.info(LL.parsed({ message: danmaku.message, type }));
			this.dispatch(type, parsed);
		});
	}
	/**不知道弹幕是啥意思，那就直接返回吧 */
	async [Command.Idk](danmaku: Danmaku) {
		return { previous: Command.Idk, danmaku } as const;
	}
	/**尝试解析这个弹幕是点的哪种歌，尝试失败就说不知道弹幕意思 */
	async [Command.Song](danmaku: Danmaku) {
		for (const player of this.players) {
			const parsed = await player.parse(danmaku);
			if (parsed) return parsed;
		}
		return Command.Idk;
	}
	/**找到发送取消弹幕的人的点歌身份 */
	async [Command.Cancel](danmaku: Danmaku) {
		return getPicker(danmaku);
	}
}

