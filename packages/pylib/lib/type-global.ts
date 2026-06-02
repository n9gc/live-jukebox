/**
 * 全局类型注册
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'pylib/type-global';

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
		/**全部联合类型 */
		const all: typeof allDefined;
	}
}

Reflect.set(globalThis, 'PylibTypes', {});

/**必须要定义的类型名称 */
const mustTypeNames = ['Argument', 'Data'] as const;
/**必须要定义的类型名称 */
type MustTypeName = typeof mustTypeNames[number];
/**一个类型定义文件应该符合的结构 */
export type TypesModule = Record<string, z.ZodType>
	& Record<MustTypeName, z.ZodType>;

/**
 * 注册一个模块的类型
 * @param name 模块名称
 * @param value 模块的类型集合
 */
export function registerPylibTypes<
	K extends keyof typeof PylibTypes,
	O extends TypesModule & typeof PylibTypes[K],
>(name: K, value: O) {
	PylibTypes[name] = value;
}

/**以 `Map` 形式获得所有类型 */
function getMods() {
	const mods = new Map<string, (typeof PylibTypes)[Exclude<keyof typeof PylibTypes, 'all'>]>();
	for (const service of Object.keys(PylibTypes)) {
		if (service === 'all') continue;
		const types = PylibTypes[service as never] as TypesModule;
		mods.set(service, types as any);
	}
	return mods;
}

/**类型体操 */
function atLeastOne<T>(n: T[]): [T, ...T[]] {
	const first = n.at(0);
	if (!first) throw new Error('not at least one');
	return [first, ...n.slice(1)];
}

/**`name` 字段的全部联合类型 */
function allUnion<K extends MustTypeName>(name: K) {
	return z.discriminatedUnion(
		'service',
		atLeastOne([...getMods().values()].map(n => n[name])),
	);
}

/**全部联合类型 */
const allDefined = {
	get Data() {
		return allUnion('Data');
	},
	get Argument() {
		return allUnion('Argument');
	},
};

registerPylibTypes('all', allDefined);

/**得到 json schema */
export function getSchemas() {
	const schemas = new Map<string, z.core.ZodStandardJSONSchemaPayload<z.ZodType>[]>([
		['all', mustTypeNames.map(name => {
			const schema = allDefined[name]
				.toJSONSchema({ metadata: z.registry(), reused: 'inline' });
			schema.title = name;
			return schema;
		})],
	]);
	for (const [service, types] of getMods()) {
		const list: z.core.ZodStandardJSONSchemaPayload<z.ZodType>[] = [];
		for (const name of mustTypeNames) {
			const zodType = types[name];
			const schema = zodType.toJSONSchema();
			schema.title = name;
			list.push(schema);
		}
		schemas.set(service, list);
	}
	return schemas;
}

