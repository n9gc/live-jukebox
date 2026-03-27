import { execSync } from 'child_process';
import { pipPath, run } from '.';

const scripts = new Map([[
	'prepare', () => {
		const pyExe = process.env.PY_EXE ?? 'python';

		run(
			() => execSync(`${pyExe} --version`, { stdio: 'inherit' }),
			e => console.error(`Cannot find '${pyExe}', use $PY_EXE instead.`, e),
		);

		run(
			() => execSync(`${pyExe} -m venv .venv`, { stdio: 'inherit' }),
			e => console.error('init venv failed', e),
		);


		const mirror = process.env.PY_MIRROR ?? '';
		const mirrorCmd = mirror && `-i ${mirror}`;

		run(
			() => execSync(`"${pipPath}" install ${mirrorCmd} -r requirements.txt`, { stdio: 'inherit' }),
			e => console.error('pip install failed', e),
		);
	},
]]);

(scripts.get(process.argv.at(-1) ?? '') ?? (() => {
	console.error('what do you want to do?');
	process.exit(1);
}))();

