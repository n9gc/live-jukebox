/**
 * 工具类型
 * @license MIT
 * @author n9gc
 */
declare module 'tape-i18n/types/utility';

import { innerGlobalLL } from 'tape-i18n/i18n/global';
import { LLMappers, mergeMapped, WithMapped } from 'tape-i18n/logger/llmapper';
import { LoggerWrap, VisitedLL } from 'tape-i18n/logger/wrap';
import type {
	FlatTranslationFunctions,
	ModuleTranslationFunctions,
	PathsOf,
} from 'tape-i18n/types';

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
		C extends LLMappers = {},
	>(scope: P, mappers: C):
		LoggerWrap<T, P> & WithMapped<VisitedLL<T, P>, C> => {
		const memoriedWrap = wrapMap.get(scope);
		if (memoriedWrap) return memoriedWrap as any;

		class Wrap extends LoggerWrap<T, P> {}
		const wrap = new Wrap(globalLL, scope);
		const merged = mergeMapped(wrap.logger, wrap.LL, wrap, mappers);
		wrapMap.set(scope, merged);
		return merged;
	};
}

/**如果你不是增量构建，每个包都可以用这个函数 */
export const initLogger = getLoggerIniter(innerGlobalLL);

