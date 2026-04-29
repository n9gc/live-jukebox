/**
 * 读取 B 站的弹幕
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module '.';

import { Reader } from 'lib/reader';
import { ChildProcessWithoutNullStreams } from 'node:child_process';
import * as z from 'zod';
import { listenDm, ListenDmConfig } from './listen';
import { BiliDanmaku, PyBiliDanmaku } from './types';

/**b 站弹幕读取器的配置 */
export const BiliReaderConfig = ListenDmConfig.safeExtend({
	/**判断是否忽略一个评论 */
	isIgnored: z.function({
		input: [PyBiliDanmaku.out],
		output: z.boolean(),
	}).optional(),
});
export type BiliReaderConfig = z.infer<typeof BiliReaderConfig>;

/**b 站弹幕读取器 */
export default class BiliReader extends Reader {
	/**py 弹幕读取脚本的进程 */
	proce: ChildProcessWithoutNullStreams;
	constructor(config: BiliReaderConfig) {
		super();
		this.proce = listenDm(config, pyDanmaku => {
			const damaku: BiliDanmaku = {
				...pyDanmaku,
				ignore: config.isIgnored?.(pyDanmaku) ?? false,
			};
			this.dispatch('danmaku', damaku);
		});
	}
}

