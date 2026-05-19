/**@import { TsToZodConfig } from 'ts-to-zod' */

/**@type {TsToZodConfig} */
const configs = [
	{
		jsDocTagFilter: tags => tags.some(tag => tag.name === 'zod'),
		name: 'types',
		input: 'lib/types.ts',
		output: 'dist/types-schema.ts',
		keepComments: true,
		getSchemaName: id => id,
	},
];

export default configs;

