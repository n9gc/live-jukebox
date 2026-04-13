/**@import { ConfigArray } from 'typescript-eslint' */
import { includeIgnoreFile } from '@eslint/compat';
import eslint from '@eslint/js';
import accurtypeStyle from 'eslint-config-accurtype-style';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';

/**@type {(n: string) => string} */
const pathTo = n => fileURLToPath(new URL(n, import.meta.url));

/**@type {ConfigArray} */
const config = defineConfig(
	...accurtypeStyle,
	eslint.configs.recommended,
	...tseslint.configs.stylisticTypeChecked,
	{
		name: 'TS Base Config',
		languageOptions: {
			parserOptions: {
				tsconfigRootDir: pathTo('..'),
				project: [
					'config/tsconfig.json',
					'packages/*/tsconfig.json',
				],
			},
		},
	},
	{
		name: 'Opt Rules',
		rules: { 'no-unused-vars': 'off' },
	},
	includeIgnoreFile(pathTo('../.gitignore')),
	{
		name: 'Global Ignore',
		ignores: [
			'**/*.md',
			'eslint.config.mjs',
			'.*',
			'**/dist',
			'packages/*/.next',
			'packages/*/next-env.d.ts',
		],
	},
	{
		name: 'JS Ignore',
		ignores: [
		],
	},
	{
		name: 'Node Env',
		files: [
			'config/cz-config.cjs',
		],
		languageOptions: { globals: globals.node },
	},
);
export default config;
