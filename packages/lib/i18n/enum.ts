/**
 * 枚举相关 i18n
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/i18n/enum';

import { getLogger } from '@logtape/logtape';
import type * as lib from 'lib';
import { packageLL } from 'lib/i18n';
import type { Asserted, Enum, Enumified, EnumOwnKeyOf } from 'lib/types';

/**得到一个模块所有枚举各自的键名称 */
type ModuleEnumKeyOf<M, N extends keyof M> = N extends N
	? M[N] extends Enum ? `${Asserted<N, string>}_${EnumOwnKeyOf<M[N]>}` : never
	: never;
/**得到库所有枚举各自的键名称 */
type PackageEnumKeyOf<K extends keyof typeof lib> = K extends K
	? ModuleEnumKeyOf<typeof lib[K], keyof typeof lib[K]>
	: never;
/**项目里的所有枚举的翻译对象 */
export interface AllEnumTranslation {
	/**枚举的翻译 */
	enums: Record<PackageEnumKeyOf<keyof typeof lib>, string>;
}

/**得到一个模块所有的枚举成员 */
type ModuleEnumValueOf<M, N extends keyof M> = N extends N
	? M[N] extends Enum ? Enumified<M[N]> : never
	: never;
/**得到库所有枚举各自的键名称 */
type PackageEnumValueOf<K extends keyof typeof lib> = K extends K
	? ModuleEnumValueOf<typeof lib[K], keyof typeof lib[K]>
	: never;
/**项目里所有的枚举 */
export type AllEnum = PackageEnumValueOf<keyof typeof lib>;

/**避免循环依赖的 thr 的一个小实现 */
function thr<
	T extends Record<string, unknown>,
>(localize: (info: T) => string, cause: T): never {
	const message = localize(cause);
	getLogger(['lib', 'i18n', 'enum']).fatal(message, cause);
	const error = new Error(message, { cause });
	throw error;
}

/**
 * 判断一个键是否是有对应枚举翻译的键
 * @throws {Error} 没有对应翻译时
 */
export function assertsEnumKey(nameKey: string):
	asserts nameKey is keyof AllEnumTranslation['enums'] {
	if (!(nameKey in globalLL.lib.enums)) {
		const keys = Object.keys(globalLL.lib.enums);
		thr(packageLL.i18n.enum.notEnumKey, { nameKey, keys });
	}
}

/**
 * 翻译枚举对象
 * @throws {Error} sym 没有名字，或者枚举没有注册翻译时
 */
export function translateEnum(sym: AllEnum): string {
	const [name, key] = (Symbol.keyFor(sym)
		?? thr(packageLL.i18n.enum.noNameSymbol, { sym }))
		.split('.');
	const nameKey = `${name}_${key}`;
	assertsEnumKey(nameKey);
	const localString = globalLL.lib.enums[nameKey]();
	return `${name}:[${localString}]`;
}

