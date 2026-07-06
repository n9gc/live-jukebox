/**
 * 调用器相关的类型
 * @license MIT
 * @author n9gc
 */
declare module './types.ts';

import * as z from 'zod';
import * as Schema from '../../dist/lib-caller-types.ts';
import { jsonCodec } from '../types.ts';

/**和 py 沟通的信息的类型 @zoded */
export type InfoTypes = (typeof InfoTypes)[number];
export const InfoTypes = [
	'HandlerInput',
	'HandlerOutput',
	'ServiceInput',
	'ServiceOutput',
] as const;

/**@schema lazy(() => bigintCodec); import { bigintCodec } from '../lib/types.ts' */
type Bigint = bigint;

/**和异步函数对接的信息 */
interface HandlerInfo {
	/**导出的是异步函数 */
	readonly type: 'handler';
	/**异步函数的名字 */
	readonly name: string;
	/**调用的 id */
	readonly callId: Bigint;
}

/**异步函数的输入信息 */
export interface HandlerInput extends HandlerInfo {
	/**
	 * 输入列表
	 * @schema unknown().array().readonly()
	 */
	readonly inputs: readonly unknown[];
}
export const HandlerInput = Schema.HandlerInput;

/**异步函数的输出信息 */
export interface HandlerOutput extends HandlerInfo {
	/**输出 */
	readonly output: unknown;
}
export const HandlerOutput = Schema.HandlerOutput;

/**和服务对接的信息 */
export interface ServiceInfo {
	/**导出的是服务 */
	readonly type: 'service';
	/**服务的名字 */
	readonly name: string;
	/**和服务对接的数据 */
	readonly data: unknown;
}
export const ServiceInfo = Schema.ServiceInfo;

/**
 * 得到一个异步函数的输入编解码器
 * @param name 异步函数的名字
 * @param input 输入的 zod schema
 * @returns 编解码器
 */
export function HandlerInputCodec<
	T extends readonly [z.ZodType, ...z.ZodType[]],
	N extends string,
>(name: N, input: T) {
	return jsonCodec(
		z.object({
			...HandlerInput.shape,
			name: z.literal(name),
			inputs: z.tuple(input).readonly(),
		}).readonly(),
	);
}

/**
 * 得到一个异步函数的输出编解码器
 * @param name 异步函数的名字
 * @param output 输出的 zod schema
 * @returns 编解码器
 */
export function HandlerOutputCodec<
	T extends z.ZodType,
	N extends string,
>(name: N, output: T) {
	return jsonCodec(
		z.object({
			...HandlerOutput.shape,
			name: z.literal(name),
			output,
		}).readonly(),
	);
}

/**
 * 得到一个服务的输入或输出编解码器
 * @param name 服务的名字
 * @param info
 * 输入或输出的所有可能类型的 zod schema
 * 每个都是一个 ZodTuple ，开头的第一个元素表示事件名称
 * @returns 编解码器
 */
export function ServiceInfoCodec<
	T extends z.ZodType,
	N extends string,
>(name: N, data: T) {
	return jsonCodec(
		z.object({
			...ServiceInfo.shape,
			name: z.literal(name),
			data,
		}).readonly(),
	);
}

