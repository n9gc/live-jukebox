/**
 * 对接 Python 库的实用函数和信息
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'pylib/utility';

import { getDirname } from 'esm-entry';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

/**是不是 Win 平台 */
export const isWindows = process.platform === 'win32';
/**虚拟环境 */
export const venvPath = path.join(getDirname(import.meta.url), '../.venv');
/**虚拟环境的 pip */
export const pipPath = path.join(venvPath, isWindows ? 'Scripts/pip' : 'bin/pip');
/**虚拟环境的 python */
export const pyPath = path.join(venvPath, isWindows ? 'Scripts/python' : 'bin/python');

/**
 * 测试可执行文件
 * @param where 可执行文件的路径
 * @throws {Error} 如果没成功抛出错误
 */
export function testExe(where: string) {
	const { error } = spawnSync(where, ['--version'], { stdio: 'inherit' });
	if (error) throw error;
}
/**
 * 加载输出配置，同时避免类型超出 tsconfig 的根目录
 */
export async function loadLogConfig() {
	await import('../../../config/' + 'logtape.config.ts');
}

