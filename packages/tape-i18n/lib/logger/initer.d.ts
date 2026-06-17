/**
 * 包装类的初始化和复用
 * @license MIT
 * @author n9gc
 */
declare module 'tape-i18n/types/utility';
import { innerGlobalLL } from 'tape-i18n/i18n/global';
import { LLMappers, WithMapped } from 'tape-i18n/logger/llmapper';
import { LoggerWrap, VisitedLL } from 'tape-i18n/logger/wrap';
import type { AllPathsOf, ModuleTranslationFunctions } from 'tape-i18n/types';
/**
 * 如果你是增量构建，那么每个包都要调用一次这个，得到每个包唯一的 initLogger
 * @param globalLL 全局的多语言对象
 * @param mappers 如果有需要，这用来描述日志器额外的函数对象
 */
export declare function getLoggerIniterWithLL<T extends ModuleTranslationFunctions, C extends LLMappers = {}>(globalLL: T, mappers: C): <P extends AllPathsOf<T>>(scope: P) => LoggerWrap<T, P> & WithMapped<VisitedLL<T, P>, C>;
/**
 * 如果你不是增量构建，每个包都可以用这个函数
 * @param mappers 如果有需要，这用来描述日志器额外的函数对象
 */
export declare function getLoggerIniter<C extends LLMappers = {}>(mappers: C): <P extends "tape-i18n/test">(scope: P) => LoggerWrap<innerGlobalLL, P> & WithMapped<import("tape-i18n/types").Asserted<import("tape-i18n/types").Asserted<P, "tape-i18n/test"> extends infer T ? T extends import("tape-i18n/types").Asserted<P, "tape-i18n/test"> ? T extends `${infer K}/${infer P_1}` ? K extends "tape-i18n" ? P_1 extends `${infer K}/${infer P_1}` ? K extends keyof innerGlobalLL[K] ? P_1 extends `${infer K}/${infer P_1}` ? K extends keyof innerGlobalLL[K][K] ? P_1 extends `${infer K}/${infer P_1}` ? K extends keyof innerGlobalLL[K][K][K] ? P_1 extends `${infer K}/${infer P_1}` ? K extends keyof innerGlobalLL[K][K][K][K] ? P_1 extends `${infer K}/${infer P_1}` ? K extends keyof innerGlobalLL[K][K][K][K][K] ? P_1 extends `${infer K}/${infer P_1}` ? K extends keyof innerGlobalLL[K][K][K][K][K][K] ? P_1 extends `${infer K}/${infer P_1}` ? K extends keyof innerGlobalLL[K][K][K][K][K][K][K] ? P_1 extends `${infer K}/${infer P_1}` ? K extends keyof innerGlobalLL[K][K][K][K][K][K][K][K] ? P_1 extends `${infer K}/${infer P_1}` ? K extends keyof innerGlobalLL[K][K][K][K][K][K][K][K][K] ? P_1 extends `${infer K}/${infer P_1}` ? K extends keyof innerGlobalLL[K][K][K][K][K][K][K][K][K][K] ? /*elided*/ any : never : P_1 extends keyof innerGlobalLL[K][K][K][K][K][K][K][K][K][K] ? innerGlobalLL[K][K][K][K][K][K][K][K][K][K][P_1] : never : never : P_1 extends keyof innerGlobalLL[K][K][K][K][K][K][K][K][K] ? innerGlobalLL[K][K][K][K][K][K][K][K][K][P_1] : never : never : P_1 extends keyof innerGlobalLL[K][K][K][K][K][K][K][K] ? innerGlobalLL[K][K][K][K][K][K][K][K][P_1] : never : never : P_1 extends keyof innerGlobalLL[K][K][K][K][K][K][K] ? innerGlobalLL[K][K][K][K][K][K][K][P_1] : never : never : P_1 extends keyof innerGlobalLL[K][K][K][K][K][K] ? innerGlobalLL[K][K][K][K][K][K][P_1] : never : never : P_1 extends keyof innerGlobalLL[K][K][K][K][K] ? innerGlobalLL[K][K][K][K][K][P_1] : never : never : P_1 extends keyof innerGlobalLL[K][K][K][K] ? innerGlobalLL[K][K][K][K][P_1] : never : never : P_1 extends keyof innerGlobalLL[K][K][K] ? innerGlobalLL[K][K][K][P_1] : never : never : P_1 extends keyof innerGlobalLL[K][K] ? innerGlobalLL[K][K][P_1] : never : never : P_1 extends keyof innerGlobalLL[K] ? innerGlobalLL[K][P_1] : never : never : T extends "tape-i18n" ? innerGlobalLL[T] : never : never : never, import("tape-i18n/types").FlatTranslationFunctions>, C>;
