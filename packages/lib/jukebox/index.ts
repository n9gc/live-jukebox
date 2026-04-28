/**
 * 点歌机核心逻辑
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/jukebox';

export * from './auto-picker';
export * from './config';
export * from './parser';
export * from './song-list';

import { globalLL } from 'lib/i18n';
import { getJukeboxConfig, JukeboxConfig } from 'lib/jukebox/config';
import { Command, Parser } from 'lib/jukebox/parser';
import { SongList } from 'lib/jukebox/song-list';
import { isNotOk, isOk } from 'lib/result';
import { DialogEventer, Meaning } from 'lib/types';
import { initLogger } from 'lib/util';

const { log, thr } = initLogger(globalLL, 'lib/jukebox/jukebox');

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

		this.parser = new Parser(readers, players, distinguisher)
			.addListener(
				Command.Cancel,
				this.songsAfter(picker => {
					const result = songList.cancel(picker);
					isNotOk(result)
						? log.warn.cancelFailed({ picker, result })
						: log.info.canceled(result);
					this.dialogEventer.dispatch(Meaning.ServerCancelResult, result);
				}),
			)
			.addListener(
				Command.Song,
				this.songsAfter(song => {
					const result = songList.add(song);
					log.info.picked(song);
					if (isNotOk(result)) thr.sameSongAdded(song);
				}),
			);

		dialogEventer
			.addListener(
				Meaning.ClientEnd,
				this.songsAfter(song => {
					log.info.songEnd(song);
					const result = songList.end(song);
					if (isOk(result)) return;
					log.warn.endWithWarn({ result, title: song.title });
					this.dialogEventer.dispatch(Meaning.ServerEndResult, result);
				}),
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
		const songs = await this.songList.getSongs();
		log.info.dispathList();
		this.dialogEventer.dispatch(Meaning.ServerSongs, songs);
	}
}

