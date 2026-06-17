/**
 * i18n 的格式化器
 * @license MIT
 * @author n9gc
 */
declare module 'tape-i18n/i18n/formatters';
import type { FlatTranslationFunctions, Formatters } from 'tape-i18n/types';
import type { FormattersInitializer } from 'typesafe-i18n';
import type { Locales } from './i18n-types';
/**
 * 添加 `tape-i18n` 提供的格式化器
 * @param formatters 你的格式化器
 * @returns 添加后的格式化器
 */
export declare function tapeFomatters<T extends Formatters>(formatters: T): Record<`log_${string}`, (data: unknown) => string> & T & {
    /**用这个来隐藏需要的字段，但是类型上保证字段一定出现 */
    inError: () => "";
    /**不再需要手动指定参数名，直接 `{key: symbol|log}` 就行 */
    log: () => "";
    /**
     * 可以原封不动通过 logtape 输出的字符串
     *
     * 注意与 `log_*` 的区别：
     * - 这个输出的是普通字符串，而 `log_*` 是把字符串作为值来输出；
     * - 这个只能用于字符串，而 `log_*` 可以用于任何能被 logtape 输出的值。
     * @param message 字符串
     */
    rawLog(message: string): string;
};
export declare const initFormatters: FormattersInitializer<Locales, Formatters>;
/**
 * 如果你想不需要指定 `log_abc` 格式化函数名字里的 `abc` ，直接使用 `log` 函数，
 * 那么你需要对你的 `FlatTranslationFunctions` 使用这个函数。
 * 它会自动给 log 格式化器加上字段名参数
 * @param LL 你的 `FlatTranslationFunctions`
 */
export declare function nameLogFormatter(LL: FlatTranslationFunctions): void;
