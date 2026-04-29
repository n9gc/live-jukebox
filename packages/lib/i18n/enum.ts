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

/**得到一个模块所有枚举对应的名称 */
type ModuleEnumOf<T extends 'key' | 'name', M, N extends keyof M> = N extends N
	? M[N] extends Enum ? (T extends 'key'
		? `${Asserted<N, string>}_${EnumOwnKeyOf<M[N]>}`
		: EnumOwnKeyOf<M[N]> extends never ? never : N
	) : never
	: never;
/**得到库所有枚举各自的名称 */
type PackageEnumKeyOf<T extends 'key' | 'name', K extends keyof typeof lib> = K extends K
	? ModuleEnumOf<T, typeof lib[K], keyof typeof lib[K]>
	: never;
/**项目里的所有枚举的翻译对象 */
export interface AllEnumTranslation {
	/**枚举的翻译 */
	enumKeys: Record<PackageEnumKeyOf<'key', keyof typeof lib>, string>;
	/**枚举的翻译 */
	enumNames: Record<PackageEnumKeyOf<'name', keyof typeof lib>, `${string}{0: string}${string}`>;
}
/**所有枚举的名字 */
export type AllEnumName = keyof AllEnumTranslation['enumNames'];

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
 * 判断是否是有对应翻译的枚举成员名字
 * @throws 没有对应翻译时
 */
function assertsEnumKeyOfTranlsation(keyLL: string):
	asserts keyLL is keyof AllEnumTranslation['enumKeys'] {
	const keys = Object.keys(globalLL.lib.enumKeys);
	if (!keys.includes(keyLL)) {
		thr(packageLL.i18n.enum.notEnumKey, { keyLL, keys });
	}
}

/**
 * 判断是否是有对应翻译的枚举名字
 * @throws 没有对应翻译时
 */
export function assertsEnumName(name: string):
	asserts name is AllEnumName {
	const names = Object.keys(globalLL.lib.enumNames);
	if (!names.includes(name)) {
		thr(packageLL.i18n.enum.notEnumName, { name, names });
	}
}

/**
 * 如果 symbol 的 key 为普通枚举格式，解析它
 * @throws 不是普通枚举格式时
 */
export function parseEnum(symKey: string) {
	const [name, noNameKey, ...others] = symKey.split('.');
	if (others.length > 0) thr(packageLL.i18n.enum.notEnum, { symKey });
	const keyLL = `${name}_${noNameKey}`;
	assertsEnumName(name);
	assertsEnumKeyOfTranlsation(keyLL);
	return {
		name,
		keyLL,
	};
}
/**
 * 翻译枚举对象
 * @throws sym 没有名字，或者枚举没有注册翻译时
 */
export function translateEnum(sym: AllEnum): string {
	const { keyLL, name } = parseEnum(Symbol.keyFor(sym)
		?? thr(packageLL.i18n.enum.noNameSymbol, { sym }));
	const enumString = packageLL.enumKeys[keyLL]();
	return packageLL.enumNames[name](enumString);
}

