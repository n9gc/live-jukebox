/**
 * 点歌机核心逻辑
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/jukebox';

export * from './autoPicker';
export * from './config';
export * from './parser';
export * from './songList';

import { getJukeboxConfig, JukeboxConfig } from 'lib/jukebox/config';
import { Command, Parser } from 'lib/jukebox/parser';
import { SongList } from 'lib/jukebox/songList';
import { isNotOk, isOk } from 'lib/result';
import { DialogEventer, Meaning } from 'lib/types';
import { initLogger } from 'lib/util';

const {
	logger,
	thr,
} = initLogger('jukebox');

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
						? logger.warn('{picker} canceled and failed with {result}', { picker, result })
						: logger.info('{picker} canceled song {title} of {playerName}', result as {});
					this.dialogEventer.dispatch(Meaning.ServerCancelResult, result);
				}),
			)
			.addListener(
				Command.Song,
				this.songsAfter(song => {
					const result = songList.add(song);
					logger.info('A song of {playerName} named {title} picked by {picker}', song as {});
					if (isNotOk(result)) thr('Adding a same song {*}', song as {});
				}),
			);

		dialogEventer
			.addListener(
				Meaning.ClientEnd,
				this.songsAfter(song => {
					logger.info('song named {title} of {playerName} picked by {picker} end', song as {});
					const result = songList.end(song);
					if (isOk(result)) return;
					logger.warn('but end with {result}', { result, song });
					this.dialogEventer.dispatch(Meaning.ServerEndResult, result);
				}),
			);
	}

	/**
	 * 在 fn 后触发一次歌曲列表的同步
	 * @param fn 要干的事
	 */
	protected songsAfter<T>(this: this, fn: (n: T) => void) {
		return (n: T) => {
			fn(n);
			this.dispatchSongs();
		};
	}

	/**手动触发一次歌曲列表的同步 */
	dispatchSongs(this: this) {
		const songs = this.songList.getSongs();
		logger.info(`dispath song list`, { songs });
		this.dialogEventer.dispatch(Meaning.ServerSongs, songs);
	}
}

