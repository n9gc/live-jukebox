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

import { getLogger } from '@logtape/logtape';
import type { ValueOf, Visited } from 'lib/types';
import type { AsyncLocalStorage, AsyncLocalStorageOptions } from 'node:async_hooks';
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

/**获得一个随机数，用 crypto.randomInt */
export async function randomInt(min: number, max: number): Promise<number> {
	const cryptoImported = await import('node:crypto');
	return new Promise<number>((resolve, reject) => {
		if (!cryptoImported) throw new Error('crypto not imported');
		cryptoImported.randomInt(min, max, (error, n) => {
			if (error) return reject(error);
			resolve(n);
		});
	});
}

/**浏览器没有 AsyncLocalStorage 的情况下提供的 */
class FakeAsyncLocalStorage<T> {
	disable() { /* empty */ }
	enterWith() { /* empty */ }
	exit<R, P extends any[]>(
		callback: (...parameters: P) => R,
		...parameters: P
	): R {
		return callback(...parameters);
	}
	run<R>(_: T, callback: () => R): R {
		return callback();
	}

	defaultValue: T | undefined;
	getStore() {
		return this.defaultValue;
	}

	name: string;
	constructor(options?: AsyncLocalStorageOptions) {
		this.name = options?.name ?? '';
		this.defaultValue = options?.defaultValue;
	}
}
/**获得一个 AsyncLocalStorage */
export async function getAsyncLocalStorage<T>(options?: AsyncLocalStorageOptions):
Promise<AsyncLocalStorage<T>> {
	try {
		const asyncHooksImported = await import('node:async_hooks');
		return new asyncHooksImported.AsyncLocalStorage<T>(options);
	} catch {
		return new FakeAsyncLocalStorage(options);
	}
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

/**
 * 类型和运行时判断一个值的类型是 never
 * 用于检查分支是否穷尽
 */
export function exhaust(cause: never): never {
	const logger = getLogger(['lib', 'util']);
	logger.fatal`Should be never ${cause}`;
	throw new Error(`Should be never`, { cause });
}

/**获得 object 里以 prefix 开头的键的所有值 */
export function keyStartWith<P extends string, T extends {}>(prefix: P, object: T):
readonly ValueOf<{ [K in keyof T as K extends `${P}${string}` ? K : never]: T[K] }>[] {
	return Object.keys(object)
		.filter(key => key.startsWith(prefix))
		.map(key => (object as any)[key] as any);
}

