/**
 * 点歌机核心逻辑
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/jukebox/index';
const myPath = 'lib/jukebox/index';

export * from './auto-picker';
export * from './config';
export * from './parser';
export * from './song-list';

import type { JukeboxConfig } from 'lib/jukebox/config';
import { getJukeboxConfig } from 'lib/jukebox/config';
import { Command, Parser } from 'lib/jukebox/parser';
import { SongList } from 'lib/jukebox/song-list';
import type { DialogEventer } from 'lib/types';
import { Meaning } from 'lib/types';
import { initLogger } from 'lib/util';

const { log } = initLogger(myPath);

/**点播机 */
export class Jukebox {
	/**配置 */
	protected readonly config: ReturnType<typeof getJukeboxConfig>;
	/**歌曲列表管理器 */
	protected readonly songList: SongList;
	/**弹幕解析器 */
	protected readonly parser: Parser;
	constructor(
		/**配置 */
		config: JukeboxConfig,
		/**对话 */
		protected readonly dialogEventer: DialogEventer,
	) {
		const {
			readers,
			players,
			distinguisher,
			autoPicker,
			cancelMethod,
		} = this.config = getJukeboxConfig(config);

		const songList = this.songList = new SongList(autoPicker, cancelMethod);

		this.parser = new Parser(readers, players, distinguisher, dialogEventer)
			.addListener(
				Command.Cancel,
				this.songsAfter(({ picker, pickerDisplay }) => {
					songList.cancel(picker, pickerDisplay);
				}),
			)
			.addListener(
				Command.Songs,
				this.songsAfter(songs => {
					for (const song of songs) {
						songList.add(song);
					}
				}),
			);

		dialogEventer
			.addListener(
				Meaning.ClientEnd,
				this.songsAfter(song => songList.end(song)),
			);
	}

	/**
	 * 在 fn 后触发一次歌曲列表的同步
	 * @param run 要干的事
	 */
	protected songsAfter<T>(this: this, run: (n: T) => Promise<void> | void) {
		return async (n: T) => {
			await run(n);
			await this.dispatchSongs();
		};
	}

	/**手动触发一次歌曲列表的同步 */
	async dispatchSongs(this: this) {
		const result = await this.dialogEventer.run(() => this.songList.getSongs());
		log.info.dispathList();
		this.dialogEventer.dispatch(Meaning.ServerSongs, result);
	}
}

