/**
 * 日志相关
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/util/logger';

import { capitalize } from 'tape-i18n/types';
import { getLoggerIniterWithLL, innerGlobalLL, LLMapper } from 'tape-i18n';

/**额外的实用函数的描述 */
export namespace LLMappers {
	/**抛出错误 */
	export class thr extends LLMapper {
		newKey = () => this.key;
		/**
		 * 方便地抛出错误
		 * @param parameters 对应的多语言函数的参数
		 * @throws 使用对应的多语言字符串抛出错误
		 */
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
		/**
		 * 安全调用函数
		 * @param runFunction 可能抛出错误的函数
		 * @param level 捕获到错误的等级
		 * @param parameters 对应的多语言函数的参数
		 * @throws 如果等级为 `fatal` 那么会在失败时抛出错误
		 * @returns 如果等级为 `error` 那么失败时会返回空，否则返回函数返回值
		 */
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

/**初始化日志器 */
export const initLogger = getLoggerIniterWithLL(innerGlobalLL, LLMappers);

