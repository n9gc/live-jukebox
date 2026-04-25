import { getLogger } from '@logtape/logtape';
import { initLogger } from 'lib/util';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { loadLogConfig, pipPath, testExe, venvPath } from './lib/util';

await loadLogConfig();

const { run, thr } = initLogger(getLogger(['reader-bili', 'manage']));

/**创建 .venv 文件夹 */
function createVenv() {
	if (fs.existsSync(venvPath)) return;

	const pyExe = process.env.PY_EXE ?? 'python';

	testExe(pyExe, `Cannot find '${pyExe}', use $PY_EXE instead. {error}`, run);

	run(
		() => spawn(pyExe, ['-m', 'venv', venvPath], { stdio: 'inherit' }),
		'init venv failed {error}',
	);
}

/**prepare 脚本 */
function prepare() {
	createVenv();

	const mirror = process.env.PY_MIRROR ?? '';
	const mirrorCmd = mirror ? ['-i', mirror] : [];

	testExe(pipPath, 'venv pip not found {error}', run);

	run(
		() => spawn(
			pipPath,
			['install', ...mirrorCmd, '-r', 'requirements.txt'],
			{ stdio: 'inherit' },
		),
		'pip install failed {error}',
	);
}

const scripts: Partial<Record<string, () => void>> = {
	prepare,
};

(
	scripts[process.argv.at(-1) ?? '']
	?? (() => {
		thr('what do you want to do?');
		process.exit(1);
	})
)();

