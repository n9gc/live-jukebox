/**
 * 对接 Python 库的开发脚本
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'pylib/manage';
const myPath = 'pylib/manage';

import { spawnSync } from 'node:child_process';
import * as fsp from 'node:fs/promises';
import { getSchemas } from 'pylib';
import { Project } from 'ts-morph';
import { initLogger } from './i18n';
import { loadLogConfig } from './lib/utility';
import configs from './ts-to-zod.config.mjs';

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
		await fsp.mkdir('dist/schemas', { recursive: true });
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

const project = new Project();
async function metaType() {
	for (const filePath of configs.map(n => n.output)) {
		const source = project.addSourceFileAtPath(filePath);
		for (const declaration of source.getVariableDeclarations()) {
			const initializer = declaration.getInitializer();
			if (!initializer) continue;

			const name = declaration.getName();
			const initText = initializer.getText();
			declaration.setInitializer(`${initText}.meta({ id: '${name}' })`);
		}
		await fsp.writeFile(filePath, source.getFullText());
	}
}

const scripts: Partial<Record<string, () => void>> = {
	outSchema,
	metaType,
};

(
	scripts[process.argv.at(-1) ?? '']
	?? thr.noOperation
)();

