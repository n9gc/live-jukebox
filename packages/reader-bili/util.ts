/**
 * 实用函数和信息
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module './util';

import { getDirname } from 'esm-entry';
import { run } from 'lib/util';
import { ChildProcessWithoutNullStreams, execSync, spawn } from 'node:child_process';
import path from 'node:path';
import { createInterface } from 'node:readline';
import z from 'zod';
import { PyBiliDanmaku } from './types';

/**是不是 Win 平台 */
export const isWindows = process.platform === 'win32';
/**虚拟环境 */
export const venvPath = path.join(getDirname(import.meta.url), '.venv');
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
export function testExe(where: string, info = 'not prepared') {
	run(
		() => execSync(`${where} --version`, { stdio: 'inherit' }),
		e => console.error(info, e),
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
		console.error,
	);

	proce.stderr.on('data', n => console.error('blivedm err:', n.toString()));
	proce.on('error', n => console.error('proce err:', n));
	proce.on('close', code => console.log(`blivedm 退出: ${code}`));

	const rl = createInterface({
		input: proce.stdout,
		terminal: false,
	});

	rl.on('line', n => {
		const r = PyBiliDanmaku.safeDecode(n);
		if (!r.success) throw z.treeifyError(r.error).properties;
		try {
			callback(r.data);
		} catch (err) {
			console.error(err);
		}
	});

	return proce;
}

