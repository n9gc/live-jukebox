/**
 * 实用函数
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/util';

export * from './config';
export * from './eventer';
export { default as Eventer } from './eventer';

import { getLogger, Logger } from '@logtape/logtape';
import type * as crypto from 'node:crypto';
import * as z from 'zod';

/**
 * 得到一个可以安全调用函数的
 * @param logger 日志器
 */
export function getRun(logger: Logger) {
	/**
	 * 安全调用函数
	 * @param run 可能抛出错误的函数
	 * @param info 亡语
	 * @param level 捕获到错误的等级
	 */
	return <T>(run: () => T, info = '{error}', level: 'fatal' | 'error' = 'fatal'): typeof level extends 'error' ? T | false : T => {
		try {
			return run();
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
	 * @param cause 错误详细信息
	 */
	return (why: string, cause: Record<string, unknown> = {}): never => {
		const error = new Error(why, { cause });
		logger.fatal(why, cause);
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
export const packLogger = getLogger('lib');
/**得到 logger 以及一些便捷函数 */
export function initLogger(logger: string | readonly [string, ...string[]] | Logger) {
	if (typeof logger === 'string' || 'length' in logger) logger = packLogger.getChild(logger);
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

/**导入的 crypto 模块 */
let cryptoImported: typeof crypto | undefined;
/**获得一个随机数，用 crypto.randomInt */
export async function randomInt(min: number, max: number): Promise<number> {
	cryptoImported = await import('node:crypto');
	return new Promise<number>((resolve, reject) => {
		if (!cryptoImported) throw new Error('crypto not imported');
		cryptoImported.randomInt(min, max, (error, n) => {
			if (error) return reject(error);
			resolve(n);
		});
	});
}

