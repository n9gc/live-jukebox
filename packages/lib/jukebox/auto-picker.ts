/**
 * 备选点歌器
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/jukebox/auto-picker';
const myPath = 'lib/jukebox/auto-picker';

import type { Song } from 'lib/player';
import { Enumified, mark, Picker } from 'lib/types';
import { getId, initLogger, randomInt } from 'lib/util';

const { log, sendPrompt, LL } = initLogger(myPath);

/**备选点歌器 */
export abstract class AutoPicker {
	/**歌曲列表 */
	songs: SongInfo[] = [];
	/**获得一首备选歌 */
	abstract pick(this: this): Promise<Song | undefined>;

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

/**不带额外信息，只表示可以播放的歌的信息 */
export type SongInfo = Pick<Song, 'title' | 'playerName' | 'info'>;

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
type PickerMap = Record<PickType, () => Promise<SongInfo | CommonPickerException>>;
/**播放方式切换表 */
const typeChangeMap: Record<PickType, PickType> = {
	[PickType.Random]: PickType.Sequential,
	[PickType.Sequential]: PickType.Circular,
	[PickType.Circular]: PickType.Random,
};
/**通用备选点歌器可能的异常结果 */
export type CommonPickerException = Enumified<typeof CommonPickerException>;
export namespace CommonPickerException {
	/**歌单里没歌 */
	export const NoMusic = Symbol();
	/**歌单放完了 */
	export const End = Symbol();
	mark({ CommonPickerException });
}
/**一种通用的备选点歌器 */
export class CommonPicker extends AutoPicker implements PickerMap {
	/**当前点到哪了 */
	protected index = 0;
	async [PickType.Random](this: this) {
		if (this.songs.length === 0) return CommonPickerException.NoMusic;
		this.index = await randomInt(0, this.songs.length);
		const song = this.songs[this.index];
		return song;
	};
	async [PickType.Sequential](this: this) {
		const song = this.songs.at(this.index++);
		if (song) return song;
		return this.songs.length > 0
			? CommonPickerException.End
			: CommonPickerException.NoMusic;
	};
	async [PickType.Circular](this: this) {
		const song = this.songs.at(this.index++)
			?? this.songs.at(this.index = 0);
		if (song) return song;
		return CommonPickerException.NoMusic;
	};

	/**自动点歌机所显示的点歌人 */
	protected readonly picker = Picker.parse(LL.autoPicker());
	async pick(this: this): Promise<Song | undefined> {
		const result = await this[this.pickType]();
		if (typeof result === 'symbol') {
			log.warn.pickFailed({ result });
			sendPrompt.pickFailed({ result });
			return;
		}
		const song = {
			...result,
			id: getId(),
			picker: this.picker,
			pickerDisplay: this.picker,
		};
		log.info.picked(song);
		return song;
	}
	override changeType(this: this): void {
		this.pickType = typeChangeMap[this.pickType];
		log.info.typeChanged({ pickType: this.pickType });
		sendPrompt.typeChanged({ pickType: this.pickType });
	}
	constructor(
		override pickType: PickType = PickType.Circular,
		override songs: SongInfo[] = [],
	) { super(); }
}

