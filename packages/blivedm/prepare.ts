import { execSync } from 'child_process';

function run(fn: () => void, ext: (error: unknown) => number | void) {
	try {
		fn();
	} catch (error) {
		const num = ext(error) ?? 1;
		process.exit(num);
	}
}

const pyExe = process.env.PY_EXE ?? 'python';

run(
	() => execSync(`${pyExe} --version`, { stdio: 'inherit' }),
	e => console.error(`Cannot find '${pyExe}', use $PY_EXE instead.`, e),
);

run(
	() => execSync(`${pyExe} -m venv .venv`, { stdio: 'inherit' }),
	e => console.error('init venv failed', e),
);


const isWindows = process.platform === 'win32';
const pipPath = isWindows ? '.venv/Scripts/pip' : '.venv/bin/pip';
const mirror = process.env.PY_MIRROR ?? '';
const mirrorCmd = mirror && `-i ${mirror}`;

run(
	() => execSync(`"${pipPath}" install ${mirrorCmd} -r lib/requirements.txt`, { stdio: 'inherit' }),
	e => console.error('pip install failed', e),
);
