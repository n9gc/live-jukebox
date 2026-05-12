/**
 * 日志相关
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/util/logger';

import type { LogLevel, Logger } from '@logtape/logtape';
import { getLogger } from '@logtape/logtape';
import { FlatTranslationFunctions as FlatTranslationFunctionsSchema } from 'lib/dist/types-schema';
import { innerGlobalLL } from 'lib/i18n';
import type {
	Asserted,
	Deabstracted,
	FlatTranslationFunctions,
	LocalizedString,
	ModuleTranslationFunctions,
	PathsOf,
	Visited,
} from 'lib/types';
import { capitalize, visit } from 'lib/util';
import { experimentalParseMessage, experimentalSerializeMessage } from 'typesafe-i18n/parser';
import * as z from 'zod';

const string = z.string();

/**描述怎么把多语言对象映射为各种各样的函数对象的类 */
export abstract class LLMapper {
	/**原多语言对象的键的类型。不要把它用作值 */
	readonly keyType: string = '';
	/**原多语言对象的键 */
	get key(): this['keyType'] { return this.keyType; }

	/**原多语言对象的参数的类型。不要把它用作值 */
	readonly parametersType: any[] = [];

	/**新的键名 */
	abstract newKey(this: this): string;
	/**对象里具体的函数 */
	abstract operation(...parameters: [...any[], ...this['parametersType']]): unknown;

	constructor(
		/**多语言对象的键 */
		key: string,
		/**logtape 的日志器 */
		readonly logger: Logger,
		/**多语言函数 */
		readonly LLValue: (...parameters: any[]) => LocalizedString,
	) {
		this.keyType = key;
	}

	/**内部安全运行函数 */
	safeRun<T>(run: () => T): T {
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
	localize(this: this, parameters: this['parametersType']) {
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
	[K in keyof V as ReturnType<(T & { keyType: K })['newKey']>]: (T & {
		keyType: K;
		parametersType: Parameters<Asserted<V[K], (...parameters: any[]) => any>>;
	})['operation']
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

/**把带 log 格式化器的参数都加上字段名 */
function handleRaw(LL: FlatTranslationFunctions) {
	for (const key of Object.keys(LL)) {
		const defination = string.parse(
			Object.getOwnPropertyDescriptor(LL, key)?.value,
		);
		const parsed = experimentalParseMessage(defination);
		const added = parsed.map(part => (part.kind === 'parameter'
			? {
				...part,
				transforms: part
					.transforms
					.map(pipe => (pipe.kind === 'formatter'
						&& pipe.name === 'log'
						? {
							...pipe,
							name: `log_${part.key}`,
						}
						: pipe
					)),
			}
			: part
		));
		const target = experimentalSerializeMessage(added);
		(LL as any)[key] = target;
	};
}

/**把 logtape 和 i18n 一起包装起来 */
export abstract class LoggerWrap<
	T extends ModuleTranslationFunctions = ModuleTranslationFunctions,
	P extends string = string,
	V extends FlatTranslationFunctions = FlatTranslationFunctions,
> {
	readonly logger: Logger;
	readonly LL: V;
	/**日志器 */
	log: WithMapped<V, typeof log>;
	constructor(
		/**全局的 LL */
		readonly globalLL: T,
		/**模块的名称 */
		readonly scope: P,
	) {
		this.logger = getLogger(scope.split('/'));
		const visited = visit(globalLL, scope, '/');
		const result = FlatTranslationFunctionsSchema.safeParse({ ...visited });
		if (!result.success) {
			const error = z.prettifyError(result.error);
			throw new Error('not a correct scope\n' + error, { cause: { globalLL, scope, visited } });
		}
		this.LL = visited as any;
		handleRaw(this.LL);
		this.log = mergeMapped(this.logger, this.LL, {}, log);
	}
}

namespace log {
	/**对应等级的方法对象描述 */
	abstract class LLLogMapper extends LLMapper {
		abstract readonly level: LogLevel;
		newKey = () => this.key;
		operation(...parameters: this['parametersType']) {
			const { message, info } = this.localize(parameters);
			this.logger[this.level](message, info);
			return message;
		}
	};
	/**追踪等级的日志 */
	export class trace extends LLLogMapper { readonly level = 'trace'; }
	/**调试等级的日志 */
	export class debug extends LLLogMapper { readonly level = 'debug'; }
	/**提示等级的日志 */
	export class info extends LLLogMapper { readonly level = 'info'; }
	/**警告等级的日志 */
	export class warning extends LLLogMapper { readonly level = 'warning'; }
	/**警告等级的日志 */
	export class warn extends LLLogMapper { readonly level = 'warning'; }
	/**错误等级的日志 */
	export class error extends LLLogMapper { readonly level = 'error'; }
	/**致命等级的日志 */
	export class fatal extends LLLogMapper { readonly level = 'fatal'; }
}

/**默认映射 */
export namespace defaultLLMappers {
	/**抛出错误 */
	export class thr extends LLMapper {
		newKey = () => this.key;
		operation(...parameters: this['parametersType']): never {
			const { message, info: cause } = this.localize(parameters);
			this.logger.fatal(message, cause);
			const error = new Error(message, { cause });
			throw error;
		}
	}
	/**安全调用函数 */
	export class run extends LLMapper {
		newKey = () => `if${capitalize(this.key)}` as const;
		operation<R, L extends 'fatal' | 'error'>(
			runFunction: () => R,
			level: L,
			...parameters: this['parametersType']
		): L extends 'error' ? R | undefined : R {
			const { message, info } = this.localize(parameters);
			try {
				return runFunction();
			} catch (error) {
				this.logger[level](message, info);
				if (level === 'fatal') throw error;
				return void 0 as any;
			}
		}
	}
};

/**重用相同模块的 LoggerWrap */
const memoried = new WeakMap<{}, Map<string, LoggerWrap>>();

/**被索引到的模块的多语言函数 */
export type VisitedLL<
	T extends ModuleTranslationFunctions,
	P extends PathsOf<T, FlatTranslationFunctions, '/'>,
> = Asserted<Visited<T, P, '/'>, FlatTranslationFunctions>;

/**
 * 如果你是增量构建，那么每个包都要调用一次这个，得到每个包唯一的 initLogger
 * @param globalLL 全局的多语言对象
 */
export function getLoggerIniter<T extends ModuleTranslationFunctions>(globalLL: T) {
	let wrapMap = memoried.get(globalLL);
	if (!wrapMap) {
		wrapMap = new Map();
		memoried.set(globalLL, wrapMap);
	}
	class Wrap extends LoggerWrap {}
	/**
	 * 获得把 logtape 和 i18n 一起包装起来的方便输出的对象
	 * @param scope 当前模块的路径
	 */
	return <
		P extends PathsOf<T, FlatTranslationFunctions, '/'>,
		C extends LLMappers = typeof defaultLLMappers,
	>(scope: P, mappers?: C):
		LoggerWrap<T, P, VisitedLL<T, P>> & WithMapped<VisitedLL<T, P>, C> => {
		const memoriedWrap = wrapMap.get(scope);
		if (memoriedWrap) return memoriedWrap as any;

		const wrap = new Wrap(globalLL, scope) as LoggerWrap<T, P, VisitedLL<T, P>>;
		mappers ??= defaultLLMappers as unknown as C;
		const merged = mergeMapped(wrap.logger, wrap.LL, wrap, mappers);
		wrapMap.set(scope, merged);
		return merged;
	};
}

/**如果你不是增量构建，每个包都可以用这个函数 */
export const initLogger = getLoggerIniter(innerGlobalLL);

