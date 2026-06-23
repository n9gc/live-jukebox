/**@import { TsToZodConfig } from 'ts-to-zod' */
import { glob } from 'tinyglobby';
import path from 'node:path';

const typeFiles = await glob(
	'lib/**/types.ts',
	{ cwd: new URL('.', import.meta.url) },
);

/**@satisfies {TsToZodConfig} */
const configs = typeFiles.map(input => ({
	name: `types:${input}`,
	input,
	output: `dist/${input.replaceAll(path.sep, '-')}`,
	keepComments: true,
	jsDocTagFilter: tags => tags.every(t => t.name !== 'zoded'),
	getSchemaName: id => id,
}));

export default configs;

