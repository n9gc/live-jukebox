/**@import { TsToZodConfig } from 'ts-to-zod' */

/**@type {TsToZodConfig} */
const configs = [
	{
		name: 'config-types',
		input: 'lib/config/types.ts',
		output: 'dist/config-types-schema.ts',
		keepComments: true,
		jsDocTagFilter: tags => tags.every(t => t.name !== 'zoded'),
		getSchemaName: id => id,
	},
];

export default configs;

