/**
 * 备选点歌器
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/jukebox/autoPicker';

import { Song } from 'lib/player';
import { isNotOk, ResultPick } from 'lib/result';
import { getId } from 'lib/util';

/**备选点歌器 */
export abstract class AutoPicker {
	/**歌曲列表 */
	songs: Song[] = [];
	/**获得一首备选歌 */
	abstract pick(this: this): Song | ResultPick;

	/**当前播放模式 */
	protected abstract pickType: string;
	/**切换模式，具体怎么切换可以自定义 */
	changeType(this: this): void {
		1 + 1;
	}
	/**获得当前模式 */
	getPickType(this: this): string {
		return this.pickType;
	}
}

/**播放方式 */
export const enum PickType {
	/**随机播放 */
	Random = 'random',
	/**顺序播放，放完结束 */
	Sequential = 'sequential',
	/**顺序循环播放 */
	Circular = 'circular',
}
/**播放方式对应的 `pick` 函数 */
type PickerMap = Record<PickType, AutoPicker['pick']>;
/**播放方式切换表 */
const typeChangeMap: Record<PickType, PickType> = {
	[PickType.Random]: PickType.Sequential,
	[PickType.Sequential]: PickType.Circular,
	[PickType.Circular]: PickType.Random,
};
/**一种通用的备选点歌器 */
export class CommonPicker extends AutoPicker implements PickerMap {
	/**当前点到哪了 */
	protected index = 0;
	[PickType.Random](this: this) {
		return this.songs.at(this.index = Math.floor(Math.random() * this.songs.length))
			?? ResultPick.NoMusic;
	};
	[PickType.Sequential](this: this) {
		return this.songs.at(this.index++)
			?? this.songs.length
			? ResultPick.End
			: ResultPick.NoMusic;
	};
	[PickType.Circular](this: this) {
		return this.songs.at(this.index++)
			?? this.songs.at(this.index = 0)
			?? ResultPick.NoMusic;
	};

	override pick(this: this): Song | ResultPick {
		const song = this[this.pickType]();
		if (isNotOk(song)) return song;
		return {
			...song,
			id: getId(),
		};
	}
	override changeType(this: this): void {
		this.pickType = typeChangeMap[this.pickType];
	}
	constructor(
		override pickType: PickType = PickType.Circular,
		override songs: Song[] = [],
	) { super(); }
}

