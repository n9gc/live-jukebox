/**@import { TsToZodConfig } from 'ts-to-zod' */

/**@type {TsToZodConfig} */
const configs = [
	{
		name: 'types',
		input: 'lib/types.ts',
		output: 'dist/types-schema.ts',
		keepComments: true,
		getSchemaName: id => id,
	},
];

export default configs;

