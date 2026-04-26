/**
 * 备选点歌器
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/jukebox/auto-picker';

import { Song } from 'lib/player';
import { isNotOk, ResultPick } from 'lib/result';
import { getId, initLogger } from 'lib/util';
import { RandomGenerator } from '@diplomatiq/crypto-random';

const { logger } = initLogger(['jukebox', 'CommonPicker']);

/**备选点歌器 */
export abstract class AutoPicker {
	/**歌曲列表 */
	songs: Song[] = [];
	/**获得一首备选歌 */
	abstract pick(this: this): Promise<Song | ResultPick>;

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
	protected randomer = new RandomGenerator();
	async [PickType.Random](this: this) {
		const numbers = await this.randomer.integer(0, this.songs.length - 1, 1);
		this.index = numbers.at(0) ?? 0;
		return this.songs.at(this.index)
			?? ResultPick.NoMusic;
	};
	async [PickType.Sequential](this: this) {
		return this.songs.at(this.index++)
			?? this.songs.length
			? ResultPick.End
			: ResultPick.NoMusic;
	};
	async [PickType.Circular](this: this) {
		this.index = 0;
		return this.songs.at(this.index++)
			?? this.songs.at(this.index)
			?? ResultPick.NoMusic;
	};

	override async pick(this: this): Promise<Song | ResultPick> {
		const song = await this[this.pickType]();
		if (isNotOk(song)) {
			logger.warn('auto pick failed cause {result}', { result: song });
			return song;
		}
		logger.info('auto pick a song named {title} of {playerName}', song as {});
		return {
			...song,
			id: getId(),
		};
	}
	override changeType(this: this): void {
		this.pickType = typeChangeMap[this.pickType];
		logger.info('Change type to {pickType}', { pickType: this.pickType });
	}
	constructor(
		override pickType: PickType = PickType.Circular,
		override songs: Song[] = [],
	) { super(); }
}

