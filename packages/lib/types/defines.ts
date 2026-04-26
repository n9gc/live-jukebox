/**
 * 手动定义的类型
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/types/defines';

import * as z from 'zod';

/**
 * 得到一个类型的 json codec
 * @param schema 类型的 schema
 */
export function getJsonCodec<T extends z.ZodType>(schema: T) {
	return z.codec(z.string(), schema, {
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
		encode(value) {
			return JSON.stringify(value);
		},
	});
}

