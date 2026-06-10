/**
 * 配置文件定义
 * @license MIT
 * @author n9gc
 */
declare module './types.ts';

import { Ajv } from 'ajv';
import { JSONSchema as JSONSchemaImported } from 'json-schema-typed/draft-2020-12';
import * as z from 'zod';
import * as Schema from '../../dist/config-types-schema.ts';

const ajv = new Ajv();

/**可验证的 JSON Schema @zoded */
export type JSONSchema = JSONSchemaImported;
export const JSONSchema = z
	.custom<JSONSchemaImported>()
	.superRefine((input, context) => {
		const valid = ajv.validateSchema(input);
		if (valid) return;
		if (!ajv.errors) {
			return context.addIssue({
				code: 'custom',
				message: 'Not a JSON Schema with unknown reason',
				input,
			});
		}
		for (const error of ajv.errors) {
			const path = error.instancePath.split('/').filter(Boolean);
			context.addIssue({
				code: 'custom',
				message: error.message ?? `Not a JSON Schema at keyword "${error.keyword}"`,
				path,
				params: {
					keyword: error.keyword,
					schemaPath: error.schemaPath,
					ajvParams: error.params,
				},
				input,
			});
		}
	});

/**
 * 很多个 JSON Schema
 * @schema array(JSONSchema).readonly(); import { JSONSchema } from '../lib/config/types.ts';
 */
export type Schemas = readonly JSONSchema[];
export const Schemas = Schema.Schemas;

/**定义一个导出的函数 */
export interface Callee {
	/**唯一的名字 */
	readonly name: string;
	/**可能的输入 */
	readonly input: Schemas;
	/**可能的输出 */
	readonly output: Schemas;
}
export const Callee = Schema.Callee;

/**
 * 多个函数
 * @schema array(Callee).readonly()
 */
export type Callees = readonly Callee[];
export const Callees = Schema.Callees;

/**配置定义 */
export interface Config {
	/**同步或阻塞函数 */
	readonly syncs: Callees;
	/**异步函数 */
	readonly asyncs: Callees;
	/**服务 */
	readonly services: Callees;
}
export const Config = Schema.Config;

