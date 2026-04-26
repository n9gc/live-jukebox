/**
 * 对评论读取器的定义
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/reader';

import { Eventer } from 'lib/util';
import { Danmaku } from 'lib/types';

/**读取器 */
export abstract class Reader extends Eventer<{ danmaku: Danmaku }> {}

