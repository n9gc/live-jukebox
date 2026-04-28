/**
 * 日志相关
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/util/logger';

import type { LogLevel, Logger } from '@logtape/logtape';
import { getLogger } from '@logtape/logtape';
import { globalLL } from 'lib/i18n';
import type { Asserted, PathsOf, Visited } from 'lib/types';
import { FlatTranslationFunctions, ModuleTranslationFunctions } from 'lib/types';
import { visit } from 'lib/util';
import type { LocalizedString } from 'typesafe-i18n';
import * as z from 'zod';

/**抛出错误对象 */
type ThrowerObject<T extends FlatTranslationFunctions> = {
	[K in keyof T]: (
		...parameters: Parameters<Asserted<T[K], (...parameters: any[]) => string>>
			& [Record<string, any>]
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

/**用于初始化的工具函数 */
abstract class LoggerWrapUtility<V extends FlatTranslationFunctions> {
	/**logtape 的日志器 */
	abstract readonly logger: Logger;
	/**自己模块的 LL */
	abstract readonly LL: V;

	/**把 parameters 代入到名为 key 的多语言函数中 */
	protected localize(this: this, key: keyof V, parameters: any[]) {
		const template = this.LL[key];
		const info: any = parameters.length === 1 ? parameters[0] : parameters;
		try {
			const message: LocalizedString = template(...parameters);
			const result = string.safeParse(message);
			if (!result.success) throw z.prettifyError(result.error);
			return {
				message,
				info,
			};
		} catch (error) {
			this.logger.fatal('logging fatal');
			throw error;
		}
	}

	/**
	 * 把多语言对象映射为各种各样的函数对象
	 * @param operation 对象里具体的函数
	 * @returns T 要映射到的对象
	 */
	protected init<T extends Record<string, Function>>(
		this: this,
		operation: (n: { message: LocalizedString; info: any }, ...parameters: any[]) => unknown,
	): T {
		const logObject = {} as T;
		for (const key of Object.keys(this.LL)) {
			logObject[key as keyof T] = ((...parameters: any[]) => {
				const n = this.localize(key, parameters);
				operation(n, ...parameters);
			}) as any;
		}
		return logObject;
	}


	/**初始化一个输出等级 */
	protected initLogger(this: this, level: LogLevel): V {
		return this.init(({ message, info }) => {
			this.logger[level](message, info);
			return message;
		});
	}

	/**初始化抛出错误对象 */
	protected initThr(this: this): ThrowerObject<V> {
		return this.init(({ message, info: cause }) => {
			this.logger.fatal(message, cause);
			const error = new Error(message, { cause });
			throw error;
		});
	};

	/**初始化安全调用函数 */
	protected initRun(this: this): RunnerObject<V> {
		return this.init((
			{ message, info },
			runFunction: () => unknown,
			level: 'fatal' | 'error',
		) => {
			try {
				return runFunction();
			} catch (error) {
				this.logger[level](message, info);
				if (level === 'fatal') throw error;
				return;
			}
		});
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
	constructor(
		/**全局的 LL */
		readonly globalLL: T,
		/**模块的名称 */
		readonly scope: P,
	) {
		super();
		this.logger = getLogger(scope.split('/'));
		const visited = visit(globalLL, scope, '/');
		const result = FlatTranslationFunctions.safeParse({ ...visited });
		if (!result.success) {
			const error = z.prettifyError(result.error);
			throw new Error('not a correct scope\n' + error, { cause: { globalLL, scope, visited } });
		}
		this.LL = result.data as V;
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
 * 获得把 logtape 和 i18n 一起包装起来的方便输出的对象
 * 如果你要手动指定全局多语言对象的话用这个函数，否则用 `initLogger`
 * @param globalLL 全局的多语言对象
 * @param scope 当前模块的路径
 */
export function initLoggerWithGlobal<
	T extends ModuleTranslationFunctions,
	P extends PathsOf<T, FlatTranslationFunctions, '/'>,
>(globalLL: T, scope: P): LoggerWrap<T, P, Asserted<Visited<T, P, '/'>, FlatTranslationFunctions>> {
	let wrapMap = memoried.get(globalLL);
	if (!wrapMap) {
		wrapMap = new Map();
		memoried.set(globalLL, wrapMap);
	}
	const memoriedWrap = wrapMap.get(scope);
	if (memoriedWrap) return memoriedWrap as any;
	const wrap = new class extends LoggerWrap {}(globalLL, scope);
	wrapMap.set(scope, wrap);
	return wrap as any;
}

/**以 type 而不是 interface 定义的类型上更收敛的全局多语言对象 */
const typedGlobalLL: { [I in keyof globalLL]: globalLL[I] } = globalLL;
/**
 * 获得把 logtape 和 i18n 一起包装起来的方便输出的对象
 * 不需要手动指定全局多语言对象
 * @param scope 当前模块的路径
 */
export function initLogger<
	P extends PathsOf<typeof typedGlobalLL, FlatTranslationFunctions, '/'>,
>(scope: P) {
	return initLoggerWithGlobal(typedGlobalLL, scope);
}

