/**
 * 实用类型相关
 * @license MIT
 * @author n9gc
 */
declare module './types.ts';

import { Ajv } from 'ajv';
import type { JSONSchema as JSONSchemaImported } from 'json-schema-typed/draft-2020-12';
import * as z from 'zod';

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

/**得到一个类型的 json codec */
export const jsonCodec = <T extends z.ZodType>(schema: T) => z.codec(
	z.string(),
	schema,
	{
		decode(input, context) {
			try {
				return JSON.parse(input);
			} catch (error) {
				const message = error instanceof Error ? error.message : '';
				context.issues.push({
					code: 'invalid_format',
					format: 'json',
					input,
					message,
				});
				return z.NEVER;
			}
		},
		encode: value => JSON.stringify(value),
	},
);

/**用来在字符串和大整数之间转换 */
export const bigintCodec = z.codec(
	z.string(),
	z.bigint(),
	{ decode: BigInt, encode: String },
);

