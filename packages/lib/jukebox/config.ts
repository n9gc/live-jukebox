/**
 * 点歌机的配置
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/jukebox/config';

import { AutoPicker, CommonPicker } from 'lib/jukebox/auto-picker';
import { distinguishChinese, Distinguisher } from 'lib/jukebox/parser';
import { CancelMethod } from 'lib/jukebox/song-list';
import { Player } from 'lib/player';
import { Reader } from 'lib/reader';
import { Configable, getConfigGetter } from 'lib/util';

/**默认配置初始化器 */
namespace JukeboxConfigIniter {
	/**读评论器 */
	export const readers = (): readonly Reader[] => [];
	/**播放器 */
	export const players = (): readonly Player[] => [];
	/**备选点歌器 */
	export const autoPicker = (): AutoPicker => new CommonPicker();
	/**取消的方法 */
	export const cancelMethod = (): CancelMethod => CancelMethod.Anyway;
	/**分辨弹幕属于哪种命令 */
	export const distinguisher = (): Distinguisher => distinguishChinese;
}

/**点播机配置 */
export interface JukeboxConfig extends Configable<typeof JukeboxConfigIniter> { }
/**获得点歌机配置 */
export const getJukeboxConfig = getConfigGetter(JukeboxConfigIniter);

