/**
 * 配置文件定义
 * @license MIT
 * @author n9gc
 */
declare module './types.ts';

import { Ajv } from 'ajv';
import { JSONSchema as JSONSchemaType } from 'json-schema-typed/draft-2020-12';
import * as z from 'zod';
import * as Schema from '../../dist/config-types-schema.ts';

const ajv = new Ajv();

/**可验证的 JSON Schema */
export const JSONSchemaSchema = z
	.custom<JSONSchemaType>()
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
 * @schema clone(JSONSchemaSchema); import { JSONSchemaSchema } from '../lib/config/types.ts'
 */
export type JSONSchema = JSONSchemaType;
export const JSONSchema = Schema.JSONSchema;

/**定义一个导出的函数 */
export interface Endpoint {
	/**唯一的名字 */
	readonly name: string;
	/**可能的输入的类型限制 */
	readonly input: JSONSchema;
	/**可能的输出的类型限制 */
	readonly output: JSONSchema;
}
export const Endpoint = Schema.Endpoint;

/**
 * 多个函数
 * @schema array(Endpoint).readonly()
 */
export type Endpoints = readonly Endpoint[];
export const Endpoints = Schema.Endpoints;

/**配置定义 */
export interface Config {
	/**异步函数 */
	readonly handlers?: Endpoints;
	/**服务 */
	readonly services?: Endpoints;
	/**模版文件输出的目录 */
	readonly targetDir: string;
}
export const Config = Schema.Config;
