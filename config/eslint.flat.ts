import { includeIgnoreFile } from '@eslint/compat';
import eslint from '@eslint/js';
import accurtypeStyle from 'eslint-config-accurtype-style';
import { importX } from 'eslint-plugin-import-x';
import importZod from 'eslint-plugin-import-zod';
import { configs as securityConfigs } from 'eslint-plugin-security';
import { configs as sonarjsConfigs } from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import { ConfigArray, configs as tseslintConfigs } from 'typescript-eslint';
import { pathTo } from './utility.ts';

const config: ConfigArray = defineConfig(
	...accurtypeStyle,
	eslint.configs.recommended,
	...tseslintConfigs.stylisticTypeChecked,
	unicorn.configs.recommended,
	securityConfigs.recommended as any,
	sonarjsConfigs.recommended,
	importX.flatConfigs.recommended,
	importX.flatConfigs.typescript,
	...importZod.configs.recommended,
	{
		name: 'TS Base Config',
		languageOptions: {
			parserOptions: {
				tsconfigRootDir: pathTo('..'),
				projectService: true,
			},
		},
	},
	{
		name: 'Opt Rules',
		rules: {
			'no-unused-vars': 'off',
			'sonarjs/function-return-type': 'warn',
		},
	},
	includeIgnoreFile(pathTo('../.gitignore')),
	{
		name: 'Global Ignore',
		ignores: [
			'**/*.md',
			'packages/*/.next',
			'packages/*/next-env.d.ts',
			'packages/reader-bili/py',
			'packages/test-wasm',
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

