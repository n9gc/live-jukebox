/**
 * 点歌历史类
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/jukebox/OperationsMap';

import { Song } from 'lib/player';
import { Picker } from 'lib/types';
import { thr, Result, isResult } from 'lib/util';

/**点歌历史 */
export default class OperationsMap {
	/**方便地抛出错误 */
	protected thr(why: string, ...params: unknown[]): never {
		thr(
			`点歌历史状态维护错误：${why}`,
			this,
			...params,
		);
	}

	/**操作表 */
	protected readonly map = new Map<Picker, Song[]>();

	/**
	 * 有一个歌被点了
	 * @param song 啥歌
	 */
	pick(this: this, song: Song) {
		let operations = this.map.get(song.picker);
		if (!operations) {
			operations = [];
			this.map.set(song.picker, operations);
		}
		operations.push(song);
	}

	/**
	 * 抹去一个歌
	 * @param picker 想要抹去的人是谁
	 * @param cancel 是否是以取消而非播完的形式抹去
	 * @returns 被抹去的歌
	 */
	protected erase(this: this, picker: Picker, cancel: boolean): Song | Result {
		const operations = this.map.get(picker);
		if (!operations) return Result.EraseNoOperation;
		const song = operations[cancel ? 'pop' : 'shift']()
			?? this.thr(`点歌者 ${picker} 的记录为空，却仍在记录`);
		if (song.ran && cancel) {
			operations.push(song);
			return Result.EraseErasingRan;
		}
		if (!operations.length) this.map.delete(picker);
		return song;
	}

	/**
	 * 有一个人要取消点歌
	 * @param picker 啥人
	 * @returns 要被取消的歌
	 */
	cancel(this: this, picker: Picker): Song | Result {
		return this.erase(picker, true);
	}

	/**
	 * 有一个歌播完了
	 * @param song 啥歌
	 */
	end(this: this, song: Song): Result {
		if (!song.ran) this.thr('在尝试播完没播的歌', song);
		const songEnd = this.erase(song.picker, true);
		if (isResult(songEnd)) return songEnd;
		if (songEnd !== song) this.thr('播完的歌不是播完的歌了', { songEnd, song });
		return Result.Ok;
	}
}

