/**
 * 调用 blivedm 库
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module '.';

import { getDirname } from 'esm-entry';
import { execSync, spawn } from 'node:child_process';
import path from 'node:path';
import { createInterface } from 'node:readline';
import z from 'zod';
import * as Types from './types';

export { Types };

/**
 * 安全调用函数
 * @param fn 可能抛出错误的函数
 * @param ext 用来说亡语的函数，返回一个进程返回值
 */
export function run<T>(fn: () => T, ext: (error: unknown) => number | void): T {
	try {
		return fn();
	} catch (error) {
		const num = ext(error) ?? 1;
		process.exit(num);
	}
}

/**是不是 Win 平台 */
export const isWindows = process.platform === 'win32';
/**虚拟环境 */
export const venvPath = path.join(getDirname(import.meta.url), '.venv');
/**虚拟环境的 pip */
export const pipPath = path.join(venvPath, isWindows ? 'Scripts/pip' : 'bin/pip');
/**虚拟环境的 python */
export const pyPath = path.join(venvPath, isWindows ? 'Scripts/python' : 'bin/python');
/**py 对接脚本 */
export const pyScriptPath = path.join(venvPath, '../listen.py');

/**测试虚拟环境 */
export function testPy() {
	run(
		() => execSync(`${pyPath} --version`, { stdio: 'inherit' }),
		e => console.error(`not prepared`, e),
	);
}

export const ListenConfig = z.object({
	roomId: z.number().gt(0),
	sessData: z.string().optional(),
});
export type ListenConfig = z.infer<typeof ListenConfig>;

/**
 * 监听弹幕
 * @param callback 监听器
 */
export function listenDm(config: ListenConfig, callback: (danmaku: Types.Danmaku) => void) {
	testPy();

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
		try {
			const r = Types.danmakuSchema.safeParse(JSON.parse(n));
			if (!r.success) throw z.treeifyError(r.error).properties;
			callback(r.data);
		} catch (err) {
			console.error(err);
		}
	});
}

