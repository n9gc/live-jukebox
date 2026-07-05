#!/usr/bin/env node

import { execute } from '@oclif/core';
import type { Theme } from '@oclif/core/interfaces';
import packageInfo from '../package.json' with { type: 'json' };

const theme: Theme = {
	json: {
		boolean: 'yellow',
		number: 'yellowBright',
		null: 'bold',
		string: 'green',
	},
	version: 'gray',
	command: 'cyan',
	dollarSign: 'gray',
	flag: 'yellow',
	flagDefaultValue: 'green',
	flagOptions: 'green',
	flagSeparator: 'gray',
};

await execute({
	dir: import.meta.url,
	development: process.env.NODE_ENV === 'development',
	loadOptions: {
		root: new URL('..', import.meta.url).pathname,
		pjson: {
			...packageInfo,
			oclif: {
				commands: {
					strategy: 'explicit',
					target: './lib/cli-commands/index',
				},
				bin: 'js-call-py',
				dirname: 'js-call-py',
				topicSeparator: ' ',
				theme,
			},
		},
	},
});
