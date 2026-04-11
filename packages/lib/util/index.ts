/**
 * 实用函数
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/util';

export * from './config';
export * from './Eventer';
export { default as Eventer } from './Eventer';

import { getLogger, Logger } from '@logtape/logtape';
import z from 'zod';

/**
 * 得到一个可以安全调用函数的
 * @param logger 日志器
 */
export function getRun(logger: Logger) {
	/**
	 * 安全调用函数
	 * @param fn 可能抛出错误的函数
	 * @param info 亡语
	 * @param level 捕获到错误的等级
	 */
	return <T>(fn: () => T, info = '{error}', level: 'fatal' | 'error' = 'fatal'): typeof level extends 'error' ? T | false : T => {
		try {
			return fn();
		} catch (error) {
			logger[level](info, { error });
			if (level === 'error') return false as any;
			throw error;
		}
	};
}

/**
 * 得到方便地抛出错误的函数
 * @param logger 输出错误的日志器
 */
export function getThr(logger: Logger) {
	/**
	 * 方便地抛出错误
	 * @param why 为什么抛出错误
	 * @param prop 错误详细信息
	 */
	return (why: string, prop: Record<string, unknown> = {}): never => {
		const error = Error(why, { cause: prop });
		logger.fatal(why, prop);
		throw error;
	};
}

/**全局 id */
let id = 0n;
/**获得一个全局 id */
export function getId(): `song:${bigint}` & z.core.$brand<'SongId'> {
	return `song:${id++}` as any;
}

/**库专用的日志器 */
export const libLogger = getLogger('lib');
/**得到 logger 以及一些便捷函数 */
export function initLogger(logger: string | readonly [string, ...string[]] | Logger) {
	if (typeof logger === 'string' || 'length' in logger) logger = libLogger.getChild(logger);
	const thr = getThr(logger);
	const run = getRun(logger);
	return { logger, thr, run };
}

/**
 * 获得可以原封不动通过 logtape 输出的字符串
 * @param message 字符串
 */
export function rawLog(message: string) {
	return message.replaceAll('{', '{{').replaceAll('}', '}}');
}

