/**
 * 实用小函数
 * @license MIT
 * @author accurtype
 */
declare module 'tape-i18n/utility';

/**
 * 扔出一个错误
 * @throws error
 */
export function thr(error: Error): never {
	throw error;
}

