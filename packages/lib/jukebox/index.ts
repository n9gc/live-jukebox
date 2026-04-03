/**
 * 点歌机核心逻辑
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/jukebox';

export * from './autoPicker';
export * from './parser';
export * from './songList';

import { AutoPicker, CommonPicker } from 'lib/jukebox/autoPicker';
import { CancelMethod, SongList } from 'lib/jukebox/songList';
import { Player, Song } from 'lib/player';
import { Reader } from 'lib/reader';
import { Danmaku } from 'lib/types';

/**点播机配置 */
export interface JukeboxConfig {
	/**读评论器 */
	readonly readers?: Reader[];
	/**播放器 */
	readonly players?: Player[];
	/**备选点歌器 */
	readonly autoPicker?: AutoPicker;
	/**取消的方法 */
	readonly cancelMethod?: CancelMethod;
}
/**默认配置 */
export const defaultJukeboxConfig: Required<JukeboxConfig> = {
	readers: [],
	players: [],
	autoPicker: new CommonPicker(),
	cancelMethod: CancelMethod.Blocking,
};

/**点播机 */
export class Jukebox {
	/**配置 */
	readonly config: Required<JukeboxConfig>;
	protected readonly songList: SongList;
	constructor(
		/**配置 */
		config: JukeboxConfig,
		/**发送要播放的歌曲信息的函数 */
		sender: (song: Song) => void,
		// /**发送要播放的歌曲信息的函数 */
		// sender: (song: Song) => void,
	) {
		const {
			autoPicker,
			cancelMethod,
		} = this.config = {
			...defaultJukeboxConfig,
			...config,
		};
		this.songList = new SongList(
			autoPicker,
			cancelMethod,
			sender,
		);
	}

	/**获得播放器 */
	async selectPlayer(danmaku: Danmaku): Promise<Player | null> {
		for (const player of this.config.players) {
			const song = await player.parse(danmaku);
			if (song !== null) return player;
		}
		return null;
	}
}

