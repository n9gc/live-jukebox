/**
 * 点播歌曲列表
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/jukebox/songList';

import { AutoPicker } from 'lib/jukebox/autoPicker';
import { Song } from 'lib/player';
import {
	isNotOk,
	ResultListAdd,
	ResultListCancel,
	ResultListEnd,
	ResultOk,
	ResultPick,
} from 'lib/result';
import { Enumified, mark, Picker } from 'lib/types';
import { thr } from 'lib/util';

// TODO
// /**取消播放的方法 */
// export type CancelMethod = Enumified<typeof CancelMethod>;
// export namespace CancelMethod {
// 	// TODO
// 	// /**不论如何都可以取消，包括已经播放时 */
// 	// export const Anyway = Symbol();
// 	/**如果播放，则不算可以取消的曲目，剩下仍然可取消 */
// 	export const ExceptPlaying = Symbol();
// 	/**如果播放，则不能取消任何曲目，直到播放完成 */
// 	export const Blocking = Symbol();
// 	mark({ CancelMethod });
// }
//
// /**不同取消播放方法下对歌曲的筛选函数 */
// const cancelablePredicates = {
// 	[CancelMethod.Blocking]: ({ state }) => state !== SongState.Canceled,
// 	[CancelMethod.ExceptPlaying]: ({ state }) => state === SongState.Waiting,
// } satisfies Record<CancelMethod, (handle: SongHandle) => boolean>;

/**歌单 */
export class SongList {
	constructor(
		/**备选点歌器 */
		public autoPicker: AutoPicker,
		// /**取消的方法 */
		// public cancelMethod: CancelMethod,
		/**发送要播放的歌曲信息的函数 */
		protected readonly sender: (song: Song) => void,
	) { }

	/**歌曲队列 */
	protected readonly songs: Song[] = [];
	/**
	 * 获取当前歌曲队列
	 * @returns 歌曲队列，如果为空则告诉你为啥为空
	 */
	getSongs(this: this): readonly Song[] | ResultPick {
		if (this.songs.length) return this.songs;
		const song = this.autoPicker.pick();
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

	// /**
	//  * 取消歌曲
	//  * @param picker 要取消的人
	//  */
	// cancel(this: this, picker: Picker): ResultListCancel {
	// 	const handle = this
	// 		.songs
	// 		.filter(({ song }) => song.picker === picker)
	// 		.find(cancelablePredicates[this.cancelMethod]);

	// 	if (!handle) return ResultListCancel.NoCancelable;
	// 	if (handle.state === SongState.Playing) return ResultListCancel.Playing;
	// 	handle.state = SongState.Canceled;
	// 	return ResultOk.Ok;
	// }
}


