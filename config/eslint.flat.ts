/**@import { ConfigArray } from 'typescript-eslint' */
import { includeIgnoreFile } from '@eslint/compat';
import eslint from '@eslint/js';
import accurtypeStyle from 'eslint-config-accurtype-style';
import { importX } from 'eslint-plugin-import-x';
import security from 'eslint-plugin-security';
import { configs as securityConfigs } from 'eslint-plugin-security';
import { configs as sonarjsConfigs } from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import { ConfigArray, configs as tseslintConfigs } from 'typescript-eslint';
import { pathTo } from './utility.ts';
import importZod from 'eslint-plugin-import-zod';

const config: ConfigArray = defineConfig(
	...accurtypeStyle,
	eslint.configs.recommended,
	...tseslintConfigs.stylisticTypeChecked,
	// unicorn.configs.recommended,
	// security.configs.recommended,
	// sonarjs.configs.recommended,
	// importX.flatConfigs.recommended,
	// importX.flatConfigs.typescript,
	// ...importZod.configs.recommended,
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
			'eslint.config.ts',
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

