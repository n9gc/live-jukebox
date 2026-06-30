/**
 * 配置文件定义
 * @license MIT
 * @author n9gc
 */
declare module './types.ts';

import type { JSONSchema as JSONSchemaType } from 'json-schema-typed/draft-2020-12';
import * as Schema from '../../dist/lib-config-types.ts';

/**
 * 很多个 JSON Schema
 * @schema lazy(() => JI); import { JSONSchema as JI } from '../lib/types.ts'
 */
type JSONSchema = JSONSchemaType;

/**定义一个导出的异步函数 */
export interface HandlerConfig {
	/**唯一的名字 */
	readonly name: string;
	/**
	 * 输入的类型限制
	 * @schema array(JSONSchema).readonly().optional()
	 */
	readonly inputs?: readonly JSONSchema[];
	/**输出的类型限制 */
	readonly output?: JSONSchema;
}
export const HandlerConfig = Schema.HandlerConfig;

/**定义一个导出的服务 */
export interface ServiceConfig {
	/**唯一的名字 */
	readonly name: string;
	/**可能的输入的类型限制，使用键名方便区分 */
	readonly inputs?: Record<string, JSONSchema>;
	/**可能的输出的类型限制，使用键名方便区分 */
	readonly outputs?: Record<string, JSONSchema>;
}
export const ServiceConfig = Schema.ServiceConfig;

/**
 * 一个调用器的配置定义
 * 如果可以的话只建议定义一个调用器，每个调用器都对应一个 python 进程
 */
export interface CallerConfig {
	/**启动 python 的入口文件 */
	readonly pythonScriptFile: string;
	/**
	 * 异步函数
	 * @schema array(HandlerConfig).readonly().optional()
	 */
	readonly handlers?: readonly HandlerConfig[];
	/**
	 * 服务
	 * @schema array(ServiceConfig).readonly().optional()
	 */
	readonly services?: readonly ServiceConfig[];
	/**模版文件输出的目录 */
	readonly targetDir: string;
}
export const CallerConfig = Schema.CallerConfig;
