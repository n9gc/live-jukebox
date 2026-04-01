/**
 * 点播歌曲列表
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/jukebox/songList';

import { AutoPicker } from 'lib/jukebox/autoPicker';
import { playerNames, Song } from 'lib/player';
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

/**歌曲的状态 */
export type SongState = Enumified<typeof SongState>;
export namespace SongState {
	/**还没开始播放 */
	export const Waiting = Symbol();
	/**已经被取消 */
	export const Canceled = Symbol();
	/**正在播放 */
	export const Playing = Symbol();
	mark({ SongState });
}

/**取消播放的方法 */
export type CancelMethod = Enumified<typeof CancelMethod>;
export namespace CancelMethod {
	// TODO
	// /**不论如何都可以取消，包括已经播放时 */
	// export const Anyway = Symbol();
	/**如果播放，则不算可以取消的曲目，剩下仍然可取消 */
	export const ExceptPlaying = Symbol();
	/**如果播放，则不能取消任何曲目，直到播放完成 */
	export const Blocking = Symbol();
	mark({ CancelMethod });
}

/**不同取消播放方法下对歌曲的筛选函数 */
const cancelablePredicates = {
	[CancelMethod.Blocking]: ({ state }) => state !== SongState.Canceled,
	[CancelMethod.ExceptPlaying]: ({ state }) => state === SongState.Waiting,
} satisfies Record<CancelMethod, (handle: SongHandle) => boolean>;


/**管理歌曲的状态 */
export interface SongHandle {
	/**歌曲 */
	readonly song: Song;
	/**放完了 */
	end(): void;
	/**歌曲当前的状态 */
	state: SongState;
}


/**歌单 */
export class SongList {
	constructor(
		/**备选点歌器 */
		public autoPicker: AutoPicker,
		/**取消的方法 */
		public cancelMethod: CancelMethod,
		/**发送要播放的歌曲信息的函数 */
		protected readonly sender: (song: Song) => void,
	) { }

	/**歌曲队列 */
	protected readonly songs: SongHandle[] = [];
	/**
	 * 获取当前歌曲队列
	 * @returns 歌曲队列，如果为空则告诉你为啥为空
	 */
	getSongs(this: this): Song[] | ResultPick {
		if (this.songs.length) {
			return this
				.songs
				.filter(({ state }) => state !== SongState.Canceled)
				.map(({ song }) => song);
		}
		const song = this.autoPicker.pick();
		if (isNotOk(song)) return song;
		this.add(song);
		return this.getSongs();
	}

	/**歌曲通知队列 */
	protected queue = Promise.resolve();

	/**
	 * 添加一个歌曲
	 * @param song 添加的歌曲
	 */
	add(this: this, song: Song): ResultListAdd {
		if (
			!playerNames.has(song.playerName)
		) return ResultListAdd.UnknownPlayer;
		if (
			this.songs.some(({ song: { id } }) => id === song.id)
		) return ResultListAdd.SameId;
		const {
			promise: endPromise,
			resolve: end,
		} = Promise.withResolvers<void>();
		const handle: SongHandle = {
			song,
			end,
			state: SongState.Waiting,
		};
		this.songs.push(handle);
		this.queue = this.queue.then(async () => {
			if (handle.state === SongState.Canceled) return void this.end(song);
			handle.state = SongState.Playing;
			this.sender(song);
			await endPromise;
		});
		return ResultOk.Ok;
	}

	/**
	 * 歌曲播完了
	 * @param song 播完的歌曲
	 */
	end(this: this, song: Song): ResultListEnd {
		const handle = this.songs.shift();
		if (!handle) return ResultListEnd.NotExist;
		if (handle.state === SongState.Waiting) return ResultListEnd.NotPlayed;
		if (song.id !== handle.song.id) {
			if (
				this.songs.some(({ song: { id } }) => id === song.id)
			) thr('要被结束的歌前面还有一个歌', { me: this, song });
			this.songs.unshift(handle);
			return ResultListEnd.EndBefore;
		}
		handle.end();
		return ResultOk.Ok;
	}

	/**
	 * 取消歌曲
	 * @param picker 要取消的人
	 */
	cancel(this: this, picker: Picker): ResultListCancel {
		const handle = this
			.songs
			.filter(({ song }) => song.picker === picker)
			.find(cancelablePredicates[this.cancelMethod]);

		if (!handle) return ResultListCancel.NoCancelable;
		if (handle.state === SongState.Playing) return ResultListCancel.Playing;
		handle.state = SongState.Canceled;
		return ResultOk.Ok;
	}
}


