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
import { thr } from 'lib/util';

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
					const r = songList.cancel(picker);
					this.dialogEventer.dispatch(Meaning.ServerCancelResult, r);
				}),
			)
			.addListener(
				Command.Song,
				this.songsAfter(song => {
					const r = songList.add(song);
					if (isNotOk(r)) thr('有重复添加的歌曲', song);
				}),
			);

		dialogEventer
			.addListener(
				Meaning.ClientEnd,
				this.songsAfter(song => {
					const r = songList.end(song);
					if (isOk(r)) return;
					this.dialogEventer.dispatch(Meaning.ServerEndResult, r);
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
		this.dialogEventer.dispatch(
			Meaning.ServerSongs,
			this.songList.getSongs(),
		);
	}
}

