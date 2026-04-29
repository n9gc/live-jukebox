/**
 * 点播歌曲列表
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/jukebox/song-list';

import type { AutoPicker } from 'lib/jukebox/auto-picker';
import type { Song } from 'lib/player';
import {
	AFResult,
	FResult,
	isNotOk,
	justOk,
	ResultListAdd,
	ResultListCancel,
	ResultListEnd,
	ResultOk,
	ResultPick,
	withData,
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
	async getSongs(this: this): AFResult<ResultPick, [ResultOk, readonly Song[]]> {
		if (this.songs.length > 0) return withData(this.songs);
		const result = await this.autoPicker.pick();
		if (isNotOk(result)) return result;
		const [_, song] = result;
		this.add(song);
		return this.getSongs();
	}

	/**
	 * 添加一个歌曲
	 * @param song 添加的歌曲
	 */
	add(this: this, song: Song): FResult<ResultListAdd, [ResultOk]> {
		if (
			this.songs.some(({ id }) => id === song.id)
		) return ResultListAdd.SameId;
		this.songs.push(song);
		return justOk();
	}

	/**
	 * 歌曲播完了
	 * @param song 播完的歌曲
	 */
	end(this: this, song: Song): FResult<
		ResultListEnd,
		[ResultOk] | [ResultListEnd.EndTooEarly, Song[]]
	> {
		const songEnd = this.songs.shift();
		if (!songEnd) return ResultListEnd.EndTooLate;
		if (song.id !== songEnd.id) {
			if (
				this.songs.every(({ id }) => id !== song.id)
			) {
				this.songs.unshift(songEnd);
				// 如果要被结束的歌根本不存在，说明客户端早晚了三秋了
				return ResultListEnd.EndTooLate;
			}
			const index = this.songs.findIndex(({ id }) => id === song.id);
			const removeds = this.songs.splice(0, index + 1);
			// 如果结束的歌确实在歌单里，可能是服务器没跟上客户端
			//
			// 不能让客户端等着服务器
			// 因为如果只有这一个客户端的话，服务器不会再继续往前走
			// 会导致客户端等一辈子
			return [ResultListEnd.EndTooEarly, removeds];
		}
		return justOk();
	}

	/**
	 * 取消歌曲
	 * @param picker 要取消的人
	 */
	cancel(this: this, picker: Picker): FResult<ResultListCancel, [ResultOk, Song]> {
		if (
			this.cancelMethod === CancelMethod.Blocking
			&& this.songs.at(0)?.picker === picker
		) return ResultListCancel.Playing;
		const song = this.songs.find(
			(song, index) => song.picker === picker
				&& (index !== 0 || this.cancelMethod === CancelMethod.Anyway),
		);
		if (!song) return ResultListCancel.NoCancelable;
		return withData(song);
	}
}


