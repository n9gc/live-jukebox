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
	FlatTranslationFunctions,
	ModuleTranslationFunctions,
	PathsOf,
	Visited,
} from 'lib/types';
import { visit } from 'lib/util';
import type { LocalizedString } from 'typesafe-i18n';
import { experimentalParseMessage, experimentalSerializeMessage } from 'typesafe-i18n/parser';
import * as z from 'zod';

/**抛出错误对象 */
type ThrowerObject<T extends FlatTranslationFunctions> = {
	[K in keyof T]: (
		...parameters: Parameters<Asserted<T[K], (...parameters: any[]) => string>>
			& [Record<string, any>?]
	) => never;
};
/**安全调用函数对象 */
type RunnerObject<T extends FlatTranslationFunctions> = {
	[K in keyof T as `if${Capitalize<Asserted<K, string>>}`]: <R, L extends 'fatal' | 'error'>(
		runFunction: () => R,
		level: L,
		...parameters: Parameters<Asserted<T[K], (...parameters: any[]) => string>>
	) => L extends 'error' ? R | undefined : R;
};

const string = z.string();

/**包装好的日志器 */
interface Log<V> {
	readonly log: Readonly<Record<LogLevel | 'warn', Readonly<V>>>;
}

/**多语言解析函数类 */
abstract class Localizable<V extends FlatTranslationFunctions> {
	/**logtape 的日志器 */
	abstract readonly logger: Logger;
	/**自己模块的 LL */
	abstract readonly LL: V;

	/**内部安全运行函数 */
	protected safeRun<T>(run: () => T): T {
		try {
			return run();
		} catch (error) {
			this.logger.fatal('logging fatal');
			throw error;
		}
	}

	/**把 parameters 代入到名为 key 的多语言函数中 */
	protected localize(this: this, key: keyof V, parameters: any[]) {
		const info: any = parameters.length === 1
			&& typeof parameters[0] === 'object'
			&& !Array.isArray(parameters[0])
			&& parameters[0] !== null
			? parameters[0]
			: parameters;
		return this.safeRun(() => {
			const message: LocalizedString = this.LL[key](...parameters);
			string.parse(message);
			return { message, info };
		});
	}
}

/**用于初始化的工具函数 */
abstract class LoggerWrapUtility<V extends FlatTranslationFunctions>
	extends Localizable<V> {
	/**
	 * 把多语言对象映射为各种各样的函数对象
	 * @param operation 对象里具体的函数
	 * @param keyTurner 如果要变换键名的话，修改这个函数
	 * @returns T 要映射到的对象
	 */
	protected init<T extends Record<string, Function>>(
		this: this,
		operation: (key: string, ...parameters: any[]) => unknown,
		keyTurner = (key: string) => key,
	): T {
		const logObject = {} as T;
		for (const key of Object.keys(this.LL)) {
			logObject[keyTurner(key) as keyof T] = ((...parameters: any[]) => {
				return operation(key, ...parameters);
			}) as any;
		}
		return logObject;
	}


	/**初始化一个输出等级 */
	protected initLogger(this: this, level: LogLevel): V {
		return this.init((key, ...parameters: any[]) => {
			const { message, info } = this.localize(key, parameters);
			this.logger[level](message, info);
			return message;
		});
	}

	/**初始化抛出错误对象 */
	protected initThr(this: this): ThrowerObject<V> {
		return this.init((key, ...parameters: any[]) => {
			const { message, info: cause } = this.localize(key, parameters);
			this.logger.fatal(message, cause);
			const error = new Error(message, { cause });
			throw error;
		});
	};

	/**初始化安全调用函数 */
	protected initRun(this: this): RunnerObject<V> {
		return this.init(
			(
				key,
				runFunction: () => unknown,
				level: 'fatal' | 'error',
				...parameters: any[]
			) => {
				const { message, info } = this.localize(key, parameters);
				try {
					return runFunction();
				} catch (error) {
					this.logger[level](message, info);
					if (level === 'fatal') throw error;
					return;
				}
			},
			key => `if${key.at(0)?.toUpperCase() ?? ''}${key.slice(1)}`,
		);
	};
}

/**把 logtape 和 i18n 一起包装起来 */
export abstract class LoggerWrap<
	T extends ModuleTranslationFunctions = ModuleTranslationFunctions,
	P extends string = string,
	V extends FlatTranslationFunctions = FlatTranslationFunctions,
> extends LoggerWrapUtility<V> implements Log<V> {
	readonly logger: Logger;
	readonly LL: V;
	/**日志器 */
	readonly log;
	/**抛出错误 */
	readonly thr;
	/**安全调用函数 */
	readonly run;
	/**把带 log 格式化器的参数都加上字段名 */
	private handleRaw() {
		for (const key of Object.keys(this.LL)) this.safeRun(() => {
			const defination = string.parse(
				Object.getOwnPropertyDescriptor(this.LL, key)?.value,
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
			(this.LL as any)[key] = target;
		});
	}
	constructor(
		/**全局的 LL */
		readonly globalLL: T,
		/**模块的名称 */
		readonly scope: P,
	) {
		super();
		this.logger = getLogger(scope.split('/'));
		const visited = visit(globalLL, scope, '/');
		const result = FlatTranslationFunctionsSchema.safeParse({ ...visited });
		if (!result.success) {
			const error = z.prettifyError(result.error);
			throw new Error('not a correct scope\n' + error, { cause: { globalLL, scope, visited } });
		}
		this.LL = visited as any;
		this.handleRaw();
		this.log = {
			/**追踪等级的日志 */
			trace: this.initLogger('trace'),
			/**调试等级的日志 */
			debug: this.initLogger('debug'),
			/**提示等级的日志 */
			info: this.initLogger('info'),
			/**警告等级的日志 */
			warning: this.initLogger('warning'),
			/**警告等级的日志 */
			warn: this.initLogger('warning'),
			/**错误等级的日志 */
			error: this.initLogger('error'),
			/**致命等级的日志 */
			fatal: this.initLogger('fatal'),
		};
		this.thr = this.initThr();
		this.run = this.initRun();
	}
}

/**重用相同模块的 LoggerWrap */
const memoried = new WeakMap<{}, Map<string, LoggerWrap>>();

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
	/**
	 * 获得把 logtape 和 i18n 一起包装起来的方便输出的对象
	 * @param scope 当前模块的路径
	 */
	return <
		P extends PathsOf<T, FlatTranslationFunctions, '/'>,
	>(scope: P): LoggerWrap<T, P, Asserted<Visited<T, P, '/'>, FlatTranslationFunctions>> => {
		const memoriedWrap = wrapMap.get(scope);
		if (memoriedWrap) return memoriedWrap as any;
		const wrap = new class extends LoggerWrap {}(globalLL, scope);
		wrapMap.set(scope, wrap);
		return wrap as any;
	};
}

/**如果你不是增量构建，每个包都可以用这个函数 */
export const initLogger = getLoggerIniter(innerGlobalLL);

