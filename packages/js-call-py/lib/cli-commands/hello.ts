/**
 * 示例命令
 * @license MIT
 * @author n9gc
 */
declare module './hello.ts';

import { Args, Command, Flags } from '@oclif/core';

export class hello extends Command {
	static summary = 'Say hello';
	static description = 'Say hello with your name!';
	static flags = {
		title: Flags.string({
			summary: 'Your title',
			description: 'Your title, for example, PhD. Mr. Dr.',
			char: 't',
			multiple: false,
			default: '',
		}),
	};
	static args = {
		name: Args.string({
			required: true,
			description: 'Your name',
		}),
	};
	async run() {
		const { flags: { title }, args: { name } } = await this.parse(hello);
		this.log(`Hello, ${title}${name}!`);
		this.error('abc', { exit: 3 });
	}
};
