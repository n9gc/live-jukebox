/**
 * 生成绑定的类型
 * @license MIT
 * @author n9gc
 */
declare module './gen.ts';

import { Command, Flags } from '@oclif/core';
import { compile } from '@utilize/zod';
import { cosmiconfig } from 'cosmiconfig';
import * as fsp from 'node:fs/promises';
import path from 'node:path';
import { Node, Project } from 'ts-morph';
import * as z from 'zod';
import type { InfoTypes } from '../caller/types.ts';
import { CallerConfig, neverSchema, voidSchema } from '../config/types.ts';
import type { JSONSchema } from '../types.ts';

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

	/**
	 * 转换单个 json 模式
	 * @param name 名字
	 * @param schema 模式
	 * @param codecName 这个类型的种类
	 * @param [no=0] 额外用于区分的编号
	 * @returns json 模式得到的 zod 代码
	 */
	protected async zodify(
		name: string,
		schema: JSONSchema,
		codecName: InfoTypes,
		no?: number,
	) {
		const id = name + codecName + (no ?? '');
		if (typeof schema !== 'object') {
			return this.fatal(`JSON Schema of ${id} cannot be a boolean`);
		}

		const { targetDir } = await this.configPromise;
		const mainSchema = schema.$id ??= 'Schema';
		const schemaPath = path.join(targetDir, `${id}.schema.json`);
		await fsp.writeFile(schemaPath, JSON.stringify(schema))
			.catch(error => this.fatal(`Cannot create schema file for ${id}`, error));

		const typesPath = path.join(targetDir, `${id}.types.ts`);
		await compile({ input: schemaPath, output: typesPath })
			.catch(error => this.fatal(`Cannot create zod types for ${id}`, error));

		const project = new Project();
		const source = await Promise.try(() => project.addSourceFileAtPath(typesPath))
			.catch(error => this.fatal(`Cannot read created zod types for ${id}`, error));
		const runtimeTexts: string[] = [];
		const names: string[] = [];
		const typeTexts: string[] = [];
		for (const statement of source.getStatements()) {
			if (Node.isImportDeclaration(statement)) continue;
			if (Node.isTypeAliasDeclaration(statement)) {
				typeTexts.push(statement.getName());
				continue;
			}
			if (Node.isExportable(statement)) {
				statement.setIsExported(false);
			}
			if (Node.isVariableStatement(statement)) {
				names.push(...statement.getDeclarations().map(d => d.getName()));
			}
			runtimeTexts.push(statement.getText());
		}

		const code = `
			export const ${id} = (() => {
				${runtimeTexts.join('\n')}
				return { ${names.join(', ')} };
			})();
			export namespace ${id} {
				${typeTexts
					.map(name => `export type ${name} = z.infer<typeof ${id}.${name}>`)
					.join('\n')}
			}
			export const ${id}Codec = ${codecName}Codec(
				'${name}',
				${id}.${mainSchema},
			);
		`;
		return code;
	}

	/**
	 * 转换所有函数的 json 模式为 zod
	 */
	protected async zodifyAll() {
		const {
			handlers = [],
			services = [],
			targetDir,
		} = await this.configPromise;

		const imports = await Promise.all([
			...handlers.flatMap(({ name, inputs = [], output = voidSchema }) => [
				...inputs.map(
					(schema, no) => this.zodify(name, schema, 'HandlerInput', no),
				),
				this.zodify(name, output, 'HandlerOutput'),
			]),
			...services.flatMap(({ name, input = neverSchema, output = neverSchema }) => [
				this.zodify(name, input, 'ServiceInput'),
				this.zodify(name, output, 'ServiceOutput'),
			]),
		]).catch(error => this.fatal('Cannot parse schema to zod', error));
		imports.unshift(`
			import * as z from 'zod';
			import {
				HandlerInputCodec,
				HandlerOutputCodec,
				ServiceInfoCodec as ServiceInputCodec,
				ServiceInfoCodec as ServiceOutputCodec,
			} from 'js-call-py/caller';
		`);

		await fsp.writeFile(path.join(targetDir, 'caller.ts'), imports.join('\n\n'))
			.catch(error => this.fatal('Cannot write ts main file', error));
	}
	async run() {
		const { targetDir } = await this.configPromise;
		await fsp.mkdir(targetDir, { recursive: true });
		await this.zodifyAll();
	}
};
