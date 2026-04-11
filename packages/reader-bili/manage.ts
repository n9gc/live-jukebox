import { execSync } from 'child_process';
import { run } from 'lib/util';
import { pipPath, testExe, venvPath } from './lib/util';
import fs from 'node:fs';

/**创建 .venv 文件夹 */
function createVenv() {
	if (fs.existsSync(venvPath)) return;

	const pyExe = process.env.PY_EXE ?? 'python';

	testExe(pyExe, `Cannot find '${pyExe}', use $PY_EXE instead.`);

	run(
		() => execSync(`${pyExe} -m venv ${venvPath}`, { stdio: 'inherit' }),
		e => console.error('init venv failed', e),
	);
}

/**prepare 脚本 */
function prepare() {
	createVenv();

	const mirror = process.env.PY_MIRROR ?? '';
	const mirrorCmd = mirror && `-i ${mirror}`;

	testExe(pipPath, 'venv pip not found');

	run(
		() => execSync(`"${pipPath}" install ${mirrorCmd} -r requirements.txt`, { stdio: 'inherit' }),
		e => console.error('pip install failed', e),
	);
}

const scripts: Partial<Record<string, () => void>> = {
	prepare,
};

(
	scripts[process.argv.at(-1) ?? '']
	?? (() => {
		console.error('what do you want to do?');
		process.exit(1);
	})
)();

