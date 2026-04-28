/**
 * 点播歌曲列表
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/jukebox/song-list';

import type { AutoPicker } from 'lib/jukebox/auto-picker';
import type { Song } from 'lib/player';
import {
	isNotOk,
	ResultListAdd,
	ResultListCancel,
	ResultListEnd,
	ResultOk,
	ResultPick,
} from 'lib/result';
import type { Enumified, Picker } from 'lib/types';
import { mark } from 'lib/types';

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
	 * @returns 歌曲队列，如果为空则告诉你为啥为空
	 */
	async getSongs(this: this): Promise<readonly Song[] | ResultPick> {
		if (this.songs.length > 0) return this.songs;
		const song = await this.autoPicker.pick();
		if (isNotOk(song)) return song;
		this.add(song);
		return this.getSongs();
	}

	/**
	 * 添加一个歌曲
	 * @param song 添加的歌曲
	 */
	add(this: this, song: Song): ResultListAdd {
		if (
			this.songs.some(({ id }) => id === song.id)
		) return ResultListAdd.SameId;
		this.songs.push(song);
		return ResultOk.Ok;
	}

	/**
	 * 歌曲播完了
	 * @param song 播完的歌曲
	 */
	end(this: this, song: Song): ResultListEnd {
		const songEnd = this.songs.shift();
		if (!songEnd) return ResultListEnd.EndTooLate;
		if (song.id !== songEnd.id) {
			if (
				this.songs.every(({ id }) => id !== song.id)
			) {
				this.songs.unshift(songEnd);
				return ResultListEnd.EndTooLate;
			}
			while (this.songs.shift()!.id !== song.id);
			return ResultListEnd.EndTooEarly;
		}
		return ResultOk.Ok;
	}

	/**
	 * 取消歌曲
	 * @param picker 要取消的人
	 */
	cancel(this: this, picker: Picker): ResultListCancel | Song {
		if (
			this.cancelMethod === CancelMethod.Blocking
			&& this.songs.at(0)?.picker === picker
		) return ResultListCancel.Playing;
		const song = this.songs.find(
			(song, index) => song.picker === picker
				&& (
					this.cancelMethod !== CancelMethod.ExceptPlaying
					|| index !== 0
				),
		);
		if (!song) return ResultListCancel.NoCancelable;
		return song;
	}
}


