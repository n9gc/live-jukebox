/**
 * 手动定义的类型
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/types/defines';

import z from 'zod';

/**
 * 得到一个类型的 json codec
 * @param schema 类型的 schema
 */
export function getJsonCodec<T extends z.core.$ZodType>(schema: T) {
	return z.codec(z.string(), schema, {
		decode(input, ctx) {
			try {
				return JSON.parse(input);
			} catch (err) {
				const message = err instanceof Error ? err.message : '';
				ctx.issues.push({
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

