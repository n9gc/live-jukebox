/**
 * 点播歌曲列表
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/jukebox/song-list';
const myPath = 'lib/jukebox/song-list';

import type { AutoPicker } from 'lib/jukebox/auto-picker';
import type { Song } from 'lib/player';
import type { Enumified, Picker } from 'lib/types';
import { mark } from 'lib/types';
import { initLogger } from 'lib/util';

const { thr, log, sendPrompt } = initLogger(myPath);

/**取消播放的方法 */
export type CancelMethod = Enumified<typeof CancelMethod>;
export namespace CancelMethod {
	/**不论如何都可以取消，包括已经播放时 */
	export const Anyway = Symbol();
	/**如果播放，则不算可以取消的曲目，剩下仍然可取消 */
	export const ExceptPlaying = Symbol();
	/**如果播放，则不能取消任何曲目，直到播放完成 */
	export const Blocking = Symbol();
	mark({ CancelMethod });
}

/**歌单 */
export class SongList {
	constructor(
		/**备选点歌器 */
		public autoPicker: AutoPicker,
		/**取消的方法 */
		public cancelMethod: CancelMethod,
	) {}

	/**歌曲队列 */
	protected readonly songs: Song[] = [];
	/**
	 * 获取当前歌曲队列
	 * @returns 歌曲队列
	 */
	async getSongs(this: this): Promise<Song[]> {
		if (this.songs.length > 0) return this.songs;
		const song = await this.autoPicker.pick();
		if (!song) return this.songs;
		this.add(song);
		return this.songs;
	}

	/**
	 * 添加一个歌曲
	 * @param song 添加的歌曲
	 */
	add(this: this, song: Song) {
		if (
			this.songs.some(({ id }) => id === song.id)
		) thr.sameSongAdded({ song });
		this.songs.push(song);
		log.info.picked(song);
	}

	/**
	 * 歌曲播完了
	 * @param song 播完的歌曲
	 */
	end(this: this, song: Song) {
		log.info.songEnd(song);
		const songEnd = this.songs.shift();
		if (!songEnd) {
			log.warn.endTooLate(song);
			return;
		}
		if (song.id === songEnd.id) return;
		if (
			this.songs.every(({ id }) => id !== song.id)
			// 如果要被结束的歌根本不存在，说明客户端早晚了三秋了
		) {
			this.songs.unshift(songEnd);
			log.warn.endTooLate(song);
			return;
		}
		// 如果结束的歌确实在歌单里，可能是服务器没跟上客户端
		//
		// 不能让客户端等着服务器
		// 因为如果只有这一个客户端的话，服务器不会再继续往前走
		// 会导致客户端等一辈子
		const index = this.songs.findIndex(({ id }) => id === song.id);
		const removeds = this.songs.splice(0, index + 1);
		log.error.endTooEarly({
			...song,
			songs: removeds.map(({ title }) => title),
		});
	}

	/**
	 * 取消歌曲
	 * @param picker 要取消的人的标识
	 * @param pickerDisplay 要取消的人的显示名称
	 */
	cancel(this: this, picker: Picker, pickerDisplay: string) {
		if (
			this.cancelMethod === CancelMethod.Blocking
			&& this.songs.at(0)?.picker === picker
		) {
			log.warn.cancelWhilePlaying({ pickerDisplay });
			sendPrompt.cancelWhilePlaying({ pickerDisplay });
		}
		const song = this.songs.find(
			(song, index) => song.picker === picker
				&& (index !== 0 || this.cancelMethod === CancelMethod.Anyway),
		);
		if (!song) {
			log.warn.noCancelable({ pickerDisplay });
			sendPrompt.noCancelable({ pickerDisplay });
			return;
		}
		log.info.canceled({ ...song, pickerDisplay });
		sendPrompt.canceled({ ...song, pickerDisplay });
	}
}


