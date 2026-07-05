/**
 * 生成绑定的类型
 * @license MIT
 * @author n9gc
 */
declare module './gen.ts';

import { Command, Flags } from '@oclif/core';
import { cosmiconfig } from 'cosmiconfig';
import * as fsp from 'node:fs/promises';
import * as z from 'zod';
import { CallerConfig } from '../config/types.ts';

const explorer = cosmiconfig('js-call-py');

export class gen extends Command {
	static summary = 'Generate types and templates';
	static description = 'for python bind script and js caller';
	static flags = {
		config: Flags.string({
			summary: 'The path to config file',
			description: 'use `cosmiconfig("js-call-py").load()` to import your file',
			char: 'c',
			multiple: false,
		}),
	};
	/**
	 * 放出错误信息后退出
	 * @param info 信息
	 * @param [cause=void 0] 用于生成错误对象的原因
	 */
	protected fatal(info: string, cause: unknown = void 0) {
		return this.error(
			new Error(info, cause === void 0 ? {} : { cause }),
			{ exit: 1 },
		);
	}

	/**配置缓存 */
	private configCache?: Promise<CallerConfig>;
	/**获得配置 */
	private async getConfig() {
		const { flags: { config: configFile } } = await this.parse(gen);
		const loaded = (configFile
			? await explorer.load(configFile)
				.catch(error => this.fatal('Cannot read this file', error))
			: await explorer.search()
				.catch(error => this.fatal('Cannot read the config file', error)))
			?? this.fatal('No config file');
		const r = CallerConfig.safeParse(loaded.config);
		if (!r.success) {
			this.log(`Not a good config\n${z.prettifyError(r.error)}`);
			this.logJson(loaded);
			this.exit(1);
		}
		return r.data;
	}
	/**配置 Promise */
	protected get configPromise() {
		return this.configCache
			?? (this.configCache = this.getConfig());
	}
	async run() {
		const { targetDir } = await this.configPromise;
		await fsp.mkdir(targetDir, { recursive: true });
	}
};
