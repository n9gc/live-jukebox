/**
 * 备选点歌器
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/jukebox/autoPicker';

import { PlayerName, Song } from 'lib/player';

/**备选点歌器 */
export interface AutoPicker {
	/**获得一首备选歌 */
	pick(this: this): Song<PlayerName> | null;
	/**切换模式，具体怎么切换可以自定义 */
	changeType(this: this): void;
	/**歌曲列表 */
	songs: Song<PlayerName>[];
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
export class CommonPicker implements AutoPicker, PickerMap {
	/**当前点到哪了 */
	protected index = 0;
	[PickType.Random](this: this) {
		return this.songs.at(this.index = Math.floor(Math.random() * this.songs.length))
			?? null;
	};
	[PickType.Sequential](this: this) {
		return this.songs.at(this.index++)
			?? null;
	};
	[PickType.Circular](this: this) {
		return this.songs.at(this.index++)
			?? this.songs.at(this.index = 0)
			?? null;
	};

	pick(this: this): Song<PlayerName> | null {
		return this[this.pickType]();
	}
	changeType(this: this): void {
		this.pickType = typeChangeMap[this.pickType];
	}
	constructor(
		/**播放顺序 */
		public pickType: PickType = PickType.Circular,
		public songs: Song<PlayerName>[] = [],
	) { }
}

