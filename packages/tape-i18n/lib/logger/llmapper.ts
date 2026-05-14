/**
 * 把多语言对象映射为各种函数对象相关工具
 * @license MIT
 * @author n9gc
 */
declare module 'tape-i18n/logger/llmapper';

import type { Logger } from '@logtape/logtape';
import type { Asserted, Deabstracted, FlatTranslationFunctions } from 'tape-i18n/types';
import type { LocalizedString } from 'typesafe-i18n';
import * as z from 'zod';

const string = z.string();

/**
 * 描述怎么把多语言对象映射为各种各样的函数对象的类
 *
 * `operation` 字段就是对象里具体的函数
 * 如果 `operation` 带泛型，不要指定 this 参数，否则泛型标签无法保留
 */
export abstract class LLMapper {
	/**原多语言对象的键的类型。不要把它用作值 */
	readonly keyType: string = '';
	/**原多语言对象的键 */
	protected get key(): this['keyType'] { return this.keyType; }

	/**原多语言对象的参数的类型。不要把它用作值 */
	readonly parametersType: any[] = [];

	/**新的键名 */
	abstract newKey(this: this): string;
	abstract operation(...parameters: [...any[], ...this['parametersType']]): unknown;

	constructor(
		/**多语言对象的键 */
		key: string,
		/**logtape 的日志器 */
		protected readonly logger: Logger,
		/**多语言函数 */
		protected readonly LLValue: (...parameters: any[]) => LocalizedString,
	) {
		this.keyType = key;
	}

	/**内部安全运行函数 */
	protected safeRun<T>(run: () => T): T {
		try {
			return run();
		} catch (error) {
			this.logger.fatal('logging fatal');
			throw error;
		}
	}
	/**
	 * 把 `parameters` 代入到自己的多语言函数中
	 * @returns `message` 是多语言字符串， `info` 是有用参数
	 */
	protected localize(this: this, parameters: this['parametersType']) {
		const first = parameters.at(0);
		const isObject = first && typeof first === 'object' && first.constructor === Object;
		const info = parameters.length === 1 && isObject ? first : parameters;
		return this.safeRun(() => {
			const message: LocalizedString = this.LLValue(...parameters);
			string.parse(message);
			return { message, info };
		});
	}
}

/**根据描述，得到被映射的函数对象 */
export type Mapped<V extends FlatTranslationFunctions, T extends LLMapper> = {
	[K in keyof V as ReturnType<(T & { keyType: K })['newKey']>]: OmitThisParameter<(T & {
		keyType: K;
		parametersType: Parameters<Asserted<V[K], (...parameters: any[]) => any>>;
	})['operation']>
};
/**
 * 把多语言对象映射为各种各样的函数对象
 * @param logger 日志器
 * @param LL 本模块的多语言对象
 * @param LLMapper 映射描述
 * @returns 被映射的函数对象
 */
export function mapLL<
	V extends FlatTranslationFunctions,
	T extends Deabstracted<typeof LLMapper>,
>(logger: Logger, LL: V, LLMapper: T): Mapped<V, InstanceType<T>> {
	const logObject: any = {};
	const keys: (keyof V & string)[] = Object.keys(LL);
	for (const key of keys) {
		const llMapper = new LLMapper(key, logger, LL[key]);
		const mappedKey = llMapper.newKey();
		logObject[mappedKey] = (...parameters: any[]) => llMapper.operation(...parameters);
	}
	return logObject;
}

/**映射描述表 */
export type LLMappers = Record<string, Deabstracted<typeof LLMapper>>;

/**一堆描述堆起来的 */
export type WithMapped<
	V extends FlatTranslationFunctions,
	C extends LLMappers,
> = { [K in keyof C]: Mapped<V, InstanceType<C[K]>> };
/**把映射和包装器合并 */
export function mergeMapped<
	T extends {},
	V extends FlatTranslationFunctions,
	C extends LLMappers,
>(logger: Logger, LL: V, object: T, mappers: C): T & WithMapped<V, C> {
	const keys: (keyof C)[] = Object.keys(mappers);
	for (const key of keys) {
		const mapped = mapLL(logger, LL, mappers[key]);
		object[key as never] = mapped as never;
	}
	return object as any;
}

