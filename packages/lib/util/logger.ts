/**
 * 日志相关
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/util/logger';

import { getLogger, type LogLevel, type Logger } from '@logtape/logtape';
import type { Asserted, Pathable, PathsOf, Visited } from 'lib/types';
import { visit } from 'lib/util';
import * as z from 'zod';

/**自己模块的 LL */
export const TranslationObject = z.record(z.string(), z.function());
export type TranslationObject = z.infer<typeof TranslationObject>;

/**
 * @param cause 错误详细信息
 * @param parameters 多语言的参数
 */
export type Thrower<
	T extends TranslationObject,
	K extends keyof T,
> = (
	...parameters: Parameters<Asserted<T[K], (...parameters: any[]) => string>>
		& [Record<string, any>]
) => never;
/**错误函数的对象 */
type ThrowerObject<T extends TranslationObject> = {
	/**方便地抛出错误 */
	[K in keyof T]: Thrower<T, K>;
};

const string = z.string();

/**包装好的日志器 */
interface Log<V> {
	readonly log: Readonly<Record<LogLevel | 'warn', Readonly<V>>>;
}

/**把 logtape 和 i18n 一起包装起来 */
export abstract class LoggerWrap<
	T extends Pathable<TranslationObject> = Pathable<TranslationObject>,
	P extends string = string,
	V extends TranslationObject = TranslationObject,
> implements Log<V> {
	/**logtape 的日志器 */
	readonly logger: Logger;
	/**自己模块的 LL */
	readonly LL: V;
	constructor(
		/**全局的 LL */
		readonly globalLL: T,
		/**模块的名称 */
		readonly scope: P,
	) {
		this.logger = getLogger(scope.split('/'));
		const visited = visit(globalLL, scope, '/');
		const result = TranslationObject.safeParse({ ...visited });
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
	}

	/**把 parameters 代入到名为 key 的多语言函数中 */
	protected localize(this: this, key: keyof V, parameters: never[]): string {
		const template = this.LL[key];
		try {
			const localString = template(...parameters);
			const result = string.safeParse(localString);
			if (!result.success) throw z.prettifyError(result.error);
			return result.data;
		} catch (error) {
			this.logger.fatal('logging fatal');
			throw error;
		}
	}

	/**日志器 */
	readonly log;
	/**初始化一个输出等级 */
	protected initLogger(this: this, level: LogLevel): V {
		const logObject: TranslationObject = {};
		for (const key of Object.keys(this.LL)) {
			logObject[key] = (...parameters) => {
				const info: any = parameters.length === 1 ? parameters[0] : parameters;
				this.logger[level](this.localize(key, parameters), info);
			};
		}
		return logObject as any;
	}

	/**抛出错误 */
	readonly thr;
	/**初始化抛出错误对象 */
	protected initThr(this: this): ThrowerObject<Asserted<Visited<T, P, '/'>, TranslationObject>> {
		const logObject: ThrowerObject<TranslationObject> = {};
		for (const key of Object.keys(this.LL)) {
			logObject[key] = (...parameters: never[]) => {
				const message = this.localize(key, parameters);
				const cause: any = parameters.length === 1 ? parameters[0] : parameters;
				this.logger.fatal(message, cause);
				const error = new Error(message, { cause });
				throw error;
			};
		}
		return logObject as any;
	};
}

/**重用相同模块的 LoggerWrap */
const memoried = new WeakMap<{}, Map<string, LoggerWrap>>();

/**
 * 获得把 logtape 和 i18n 一起包装起来的方便输出的对象
 * @param globalLL 全局的多语言对象
 * @param scope 当前模块的路径
 */
export function initLogger<
	T extends Pathable<TranslationObject>,
	P extends PathsOf<T, TranslationObject, '/'>,
>(globalLL: T, scope: P): LoggerWrap<T, P, Asserted<Visited<T, P, '/'>, TranslationObject>> {
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

/**
 * 给 typesafe-i18n 的格式化器添加可以用于 logtape 的函数
 * 只要 `{key: symbol|log_key}` 或者 `{obj: Info|log_obj}` 这样使用
 * `LoggerWrap` 就能通过 logtape 输出这些值，而不是简单用 i18n 拼接字符串
 * @param formatters 你的 Formatters 对象
 */
export function mixLogable<T extends {}>(formatters: T):
	T & Record<`log_${string}`, () => string> {
	return new Proxy(formatters, {
		get(target, p) {
			if (typeof p !== 'string' || !p.startsWith('log_')) {
				return Reflect.get(target, p);
			}
			const key = p.slice('log_'.length);
			return () => `{${key}}`;
		},
	});
}

/**
 * 安全调用函数
 * @param logger 日志器
 * @param run 可能抛出错误的函数
 * @param info 亡语
 * @param level 捕获到错误的等级
 */
export function run<T>(
	logger: Logger,
	run: () => T,
	info = '{error}',
	level: 'fatal' | 'error' = 'fatal',
): typeof level extends 'error' ? T | false : T {
	try {
		return run();
	} catch (error) {
		logger[level](info, { error });
		if (level === 'error') return false as any;
		throw error;
	}
};
