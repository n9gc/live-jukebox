/**
 * 日志包装器
 * @license MIT
 * @author n9gc
 */
declare module 'tape-i18n/logger/wrap';

import { getLogger, Logger, LogLevel } from '@logtape/logtape';
import { nameLogFormatter } from 'tape-i18n/i18n/formatters';
import { LLMapper, mergeMapped, WithMapped } from 'tape-i18n/logger/llmapper';
import {
	Asserted,
	FlatTranslationFunctions,
	ModuleTranslationFunctions,
	PathsOf,
	visit,
	Visited,
} from 'tape-i18n/types';
import * as z from 'zod';

/**日志器的描述 */
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

/**被索引到的模块的多语言函数 */
export type VisitedLL<
	T extends ModuleTranslationFunctions,
	P extends string,
> = Asserted<
	Visited<T, Asserted<P, PathsOf<T, FlatTranslationFunctions, '/'>>, '/'>,
	FlatTranslationFunctions
>;

/**把 logtape 和 i18n 一起包装起来 */
export abstract class LoggerWrap<
	T extends ModuleTranslationFunctions = ModuleTranslationFunctions,
	P extends string = string,
> {
	readonly logger: Logger;
	readonly LL: VisitedLL<T, P>;
	/**日志器 */
	log: WithMapped<VisitedLL<T, P>, typeof log>;
	constructor(
		/**全局的 LL */
		readonly globalLL: T,
		/**模块的名称 */
		readonly scope: P,
	) {
		this.logger = getLogger(scope.split('/'));
		const visited = visit(globalLL, scope, '/');
		const result = FlatTranslationFunctions.safeParse({ ...visited });
		if (!result.success) {
			const error = z.prettifyError(result.error);
			throw new Error('not a correct scope\n' + error, { cause: { globalLL, scope, visited } });
		}
		this.LL = visited as any;
		nameLogFormatter(this.LL);
		this.log = mergeMapped(this.logger, this.LL, {}, log);
	}
}

