/**
 * 实用函数
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/util';

export * from './config';
export * from './eventer';
export { default as Eventer } from './eventer';
export * from './logger';

import type { Visited } from 'lib/types';
import type * as crypto from 'node:crypto';
import * as z from 'zod';

/**全局 id */
let id = 0n;
/**获得一个全局 id */
export function getId(): `song:${bigint}` & z.core.$brand<'SongId'> {
	return `song:${id++}` as any;
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

/**
 * 通过 spliter 作为路径分隔符，以 path 访问 object
 * @param object 要被访问的对象
 * @param path 路径
 * @param spliter 分隔符
 * @returns 对象访问的结果
 */
export function visit<
	M,
	P extends string,
	S extends string = '.',
>(object: M, path: P, spliter?: S): Visited<M, P, S>;
export function visit(object: any, path: string, spliter = '.'): {} {
	let key;
	while (true) {
		const index = path.indexOf(spliter);
		if (index === -1) return object?.[path];
		key = path.slice(0, index);
		path = path.slice(index + spliter.length);
		object = object?.[key];
	}
}

