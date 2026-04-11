/**
 * 全局点歌机实例
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module '@/app/lib/jukebox';

import jukeboxConfig from 'config/jukebox.config';
import { Jukebox } from 'lib/jukebox';
import { DialogEventer } from 'lib/types';

/**对话事件 */
export const dialogEventer = new DialogEventer();
/**点歌机 */
export const jukebox = new Jukebox(jukeboxConfig, dialogEventer);

