/**
 * 多语言相关的类型
 * @license MIT
 * @author n9gc
 */
declare module 'tape-i18n/types/i18n';

import * as z from 'zod';
import { Pathable, PathsOf } from './utility';

/**格式化器 */
export type Formatters = Record<string, (value: any) => unknown>;

/**单一模块文件的多语言函数 */
export type FlatTranslationFunctions = Record<string, (...parameters: any[]) => any>;
export const FlatTranslationFunctions = z.record(z.string(), z.function({
	input: z.array(z.any()),
	output: z.any(),
}));

/**单一模块文件的多语言函数 */
export type FlatTranslation = Record<string, string>;
export const FlatTranslation = z.record(z.string(), z.string());

/**一个模块应有的多语言函数结构 */
export type ModuleTranslationFunctions = Pathable<FlatTranslationFunctions>;

/**
 * 一个模块应有的多语言定义结构
 * 为了避免 initLogger 函数无法识别模块名称，最好用这个类型限制模块多语言的定义
 */
export type ModuleTranslation = Pathable<FlatTranslation>;

/**得到模块多语言函数的所有路径 */
export type AllPathsOf<T extends ModuleTranslationFunctions>
	= PathsOf<T, FlatTranslationFunctions, '/'>;

