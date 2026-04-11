/**@import { TsToZodConfig } from 'ts-to-zod' */

/**@type {TsToZodConfig} */
const configs = [
	{
		name: 'types',
		input: 'types/index.ts',
		output: 'dist/types-schema.ts',
		keepComments: true,
		getSchemaName: id => id,
	},
];

export default configs;

