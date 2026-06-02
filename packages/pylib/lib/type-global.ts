/**
 * 全局类型注册
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'pylib/type-global';

import { getJsonCodec } from 'lib/types';
import * as z from 'zod';

declare global {
	/**
	 * 所有 Py 所需的类型
	 * 追加请用这种方式
	 * ```typescript
	 * import { registerPylibTypes } from 'pylib/type-global';
	 * import * as self from './types';
	 *
	 * declare global {
	 *   namespace PylibTypes {
	 *     export import someService = self;
	 *   }
	 * }
	 *
	 * registerPylibTypes('someService', self);
	 * ```
	 */
	namespace PylibTypes {
		/**示例模块 */
		export import demo = demoDefine;
	}
}

Reflect.set(globalThis, 'PylibTypes', {});

/**
 * 注册一个模块的类型
 * @param name 模块名称
 * @param value 模块的类型集合
 */
export function registerPylibTypes<
	K extends keyof typeof PylibTypes,
	O extends Record<string, z.ZodType> & typeof PylibTypes[K],
>(name: K, value: O) {
	PylibTypes[name] = value;
}

/**示例模块 */
namespace demoDefine {
	/**示例类型 */
	export const SomeType = getJsonCodec(z.string());
}

registerPylibTypes('demo', demoDefine);

/**得到 json schema */
export function getSchemas() {
	const schemas = new Map<string, z.core.ZodStandardJSONSchemaPayload<z.ZodType>[]>();
	for (const service of Object.keys(PylibTypes)) {
		const types = PylibTypes[service as never] as Record<string, z.ZodType>;
		const list: z.core.ZodStandardJSONSchemaPayload<z.ZodType>[] = [];
		for (const name of Object.keys(types)) {
			const zodType = types[name];
			if (!(zodType instanceof z.ZodCodec)) continue;
			const schema = zodType.toJSONSchema();
			schema.title = name;
			list.push(schema);
		}
		schemas.set(service, list);
	}
	return schemas;
}

