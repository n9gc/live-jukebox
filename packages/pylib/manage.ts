/**
 * 对接 Python 库的开发脚本
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'pylib/manage';
const myPath = 'pylib/manage';

import { spawnSync } from 'node:child_process';
import { getSchemas } from 'pylib';
import { initLogger } from './i18n';
import { loadLogConfig } from './lib/utility';
import * as fsp from 'node:fs/promises';

await loadLogConfig();

const { thr } = initLogger(myPath);

function datamodelGen(argument: Map<string, string | true>) {
	const argumentArray = [...argument.entries()]
		.flatMap(([flag, value]) => (value === true
			? [`--${flag}`]
			: [`--${flag}`, value]));
	return spawnSync(
		'uv',
		['run', 'datamodel-codegen', ...argumentArray],
		{ stdio: 'inherit', cwd: new URL('.', import.meta.url) },
	);
}

async function outSchema() {
	for (const [service, schemas] of getSchemas()) {
		await fsp.mkdir('dist/schemas');
		for (const schema of schemas) {
			if (!schema.title) throw new Error('no title');
			await fsp.writeFile(`dist/schemas/${schema.title}`, JSON.stringify(schema));
		}
		datamodelGen(new Map<string, string | true>([
			['input', 'dist/schemas/'],
			['output', `dist/${service}_type`],
			['profile', 'py-type'],
		]));
		await fsp.rm('dist/schemas', { recursive: true });
	}
}
const scripts: Partial<Record<string, () => void>> = {
	outSchema,
};

(
	scripts[process.argv.at(-1) ?? '']
	?? thr.noOperation
)();

