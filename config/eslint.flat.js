/**@import { ConfigArray } from 'typescript-eslint' */
import { includeIgnoreFile } from '@eslint/compat';
import eslint from '@eslint/js';
import accurtypeStyle from 'eslint-config-accurtype-style';
import { importX } from 'eslint-plugin-import-x';
import securityImp from 'eslint-plugin-security';
import sonarjsImp from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import { configs as tseslintConfigs } from 'typescript-eslint';
import { pathTo } from './commitlint.ts';

/**@type {any} */
const security = securityImp;
/**@type {any} */
const sonarjs = sonarjsImp;
/**@type {ConfigArray} */
const config = defineConfig(
	...accurtypeStyle,
	eslint.configs.recommended,
	...tseslintConfigs.stylisticTypeChecked,
	// unicorn.configs.recommended,
	// security.configs.recommended,
	// sonarjs.configs.recommended,
	// importX.flatConfigs.recommended,
	// importX.flatConfigs.typescript,
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
