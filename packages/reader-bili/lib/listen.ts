/**
 * B 站弹幕读取器的英文翻译文件
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module './listen';

import { rawLog } from 'lib/util';
import { ChildProcessWithoutNullStreams, spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import * as z from 'zod';
import { initLogger } from '../i18n';
import { PyBiliDanmaku } from './types';
import { pyPath, pyScriptPath, testExe } from './utility';

const { run, log } = initLogger('reader-bili/listen');

/**py 脚本需要的参数 */
export const ListenDmConfig = z.object({
	/**直播房间 URL 上面的 id */
	roomId: z.number().gt(0),
	/**已登录账号的 cookie 的 SESSDATA 字段的值 */
	sessData: z.string().optional(),
});
export type ListenDmConfig = z.infer<typeof ListenDmConfig>;


/**
 * 监听弹幕
 * @param config py 进程的参数
 * @param callback 监听器
 * @returns py 进程
 */
export function listenDm(config: ListenDmConfig, callback: (danmaku: PyBiliDanmaku) => void): ChildProcessWithoutNullStreams {
	run.ifNotPrepared(
		() => testExe(pyPath),
		'fatal',
		{ name: 'python', path: pyPath },
	);

	config.sessData ??= '';

	const proce = run.ifCannotSpawn(
		() => spawn(pyPath, ['-u', pyScriptPath, JSON.stringify(config)]),
		'fatal',
		{ pyScriptPath, config },
	);

	const { log: pyLog } = initLogger('reader-bili/blivedm');
	proce.stderr.on('data', n => pyLog.error.stderr(rawLog(n.toString())));
	proce.on('error', error => pyLog.error.processError({ error }));
	proce.on('close', code => pyLog.info.exited({ code: code ?? 0 }));

	const rl = createInterface({
		input: proce.stdout,
		terminal: false,
	});

	rl.on('line', n => {
		const r = PyBiliDanmaku.safeDecode(n);
		if (!r.success) {
			log.error.wrongFormat({
				data: n,
				parseError: z.prettifyError(r.error),
			});
			return;
		}
		try {
			callback(r.data);
		} catch (error) {
			log.error.errorWhileListen({ error });
		}
	});

	return proce;
}

