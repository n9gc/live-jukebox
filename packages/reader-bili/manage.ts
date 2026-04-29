/**
 * B 站弹幕读取器的开发脚本
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module './manage';

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { initLogger } from './i18n';
import { loadLogConfig, pipPath, testExe, venvPath } from './lib/utility';

await loadLogConfig();

const { thr, run } = initLogger('reader-bili/manage');

/**创建 .venv 文件夹 */
function createVenv() {
	if (fs.existsSync(venvPath)) return;

	const pyExe = process.env.PY_EXE ?? 'python';

	run.ifNoPyExe(
		() => testExe(pyExe),
		'fatal',
		{ pyExe },
	);

	run.ifInitVenvFailed(
		() => spawnSync(pyExe, ['-m', 'venv', venvPath], { stdio: 'inherit' }),
		'fatal',
		{ venvPath },
	);
}

/**prepare 脚本 */
function prepare() {
	createVenv();

	run.ifNoPip(
		() => testExe(pipPath),
		'fatal',
		{ pipPath },
	);

	const mirror = process.env.PY_MIRROR ?? '';
	const command = [
		'install',
		...mirror ? ['-i', mirror] : [],
		'-r',
		'requirements.txt',
	];

	run.ifPipInstallFailed(
		() => spawnSync(pipPath, command, { stdio: 'inherit' }),
		'fatal',
		{ command },
	);
}

const scripts: Partial<Record<string, () => void>> = {
	prepare,
};

(
	scripts[process.argv.at(-1) ?? '']
	?? thr.noOperation
)();

