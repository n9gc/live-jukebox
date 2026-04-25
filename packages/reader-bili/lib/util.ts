/**
 * 实用函数和信息
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module './util';

import { getDirname } from 'esm-entry';
import { initLogger, rawLog } from 'lib/util';
import { ChildProcessWithoutNullStreams, execSync, spawn } from 'node:child_process';
import path from 'node:path';
import { createInterface } from 'node:readline';
import * as z from 'zod';
import { PyBiliDanmaku } from './types';
import { getLogger } from '@logtape/logtape';

const { run, logger } = initLogger(getLogger('reader-bili'));

/**是不是 Win 平台 */
export const isWindows = process.platform === 'win32';
/**虚拟环境 */
export const venvPath = path.join(getDirname(import.meta.url), '../.venv');
/**虚拟环境的 pip */
export const pipPath = path.join(venvPath, isWindows ? 'Scripts/pip' : 'bin/pip');
/**虚拟环境的 python */
export const pyPath = path.join(venvPath, isWindows ? 'Scripts/python' : 'bin/python');
/**py 对接脚本 */
export const pyScriptPath = path.join(venvPath, '../py/listen.py');

/**
 * 测试可执行文件
 * @param where 可执行文件的路径
 * @param info 如果找不到，提示什么
 */
export function testExe(where: string, info = 'not prepared {error}', runDef = run) {
	runDef(
		() => execSync(`${where} --version`, { stdio: 'inherit' }),
		info,
	);
}

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
	testExe(pyPath);

	config.sessData ??= '';

	const proce = run(
		() => spawn(pyPath, ['-u', pyScriptPath, JSON.stringify(config)]),
		'spawn python failed: {error}',
	);

	const pyLogger = logger.getChild('blivedm');
	proce.stderr.on('data', n => pyLogger.error(rawLog(n.toString())));
	proce.on('error', error => logger.error('process error {error}', { error }));
	proce.on('close', code => logger.info`blivedm exit: ${code}`);

	const rl = createInterface({
		input: proce.stdout,
		terminal: false,
	});

	rl.on('line', n => {
		const r = PyBiliDanmaku.safeDecode(n);
		if (!r.success) {
			pyLogger.error(z.prettifyError(r.error));
			return;
		}
		try {
			callback(r.data);
		} catch (error) {
			logger.error('catched error {error}', { error });
		}
	});

	return proce;
}

/**
 * 加载输出配置，同时避免类型超出 tsconfig 的根目录
 */
export async function loadLogConfig() {
	await import('../../../config/' + 'logtape.config.ts');
}

