/**@import { TsToZodConfig } from 'ts-to-zod' */
import { glob } from 'node:fs/promises';
import path from 'node:path';

const typeFiles = await Array.fromAsync(glob('lib/**/types.ts'));

/**@type {TsToZodConfig} */
const configs = typeFiles.map(input => ({
	jsDocTagFilter: tags => tags.some(tag => tag.name === 'zod'),
	name: `types:${input}`,
	input,
	output: `dist/${input.replaceAll(path.sep, '-')}`,
	keepComments: true,
	getSchemaName: id => id,
}));

export default configs;

