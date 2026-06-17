/**
 * 把多语言对象映射为各种函数对象相关工具
 * @license MIT
 * @author n9gc
 */
declare module 'tape-i18n/logger/llmapper';
import type { Logger } from '@logtape/logtape';
import type { Asserted, Deabstracted, Ensured, FlatTranslationFunctions } from 'tape-i18n/types';
import type { LocalizedString } from 'typesafe-i18n';
/**描述类的类型参数 */
declare abstract class LLMapperTypeParameters {
    /**原多语言对象的键的类型。不要把它用作值 */
    readonly KeyType: string;
    /**用来惰性接受原多语言对象参数类型。不要以任何形式使用它 */
    ParametersTypeInput(n: never): unknown;
    /**原多语言对象的参数的类型。不要把它用作值 */
    readonly ParametersType: Ensured<ReturnType<this['ParametersTypeInput']>, readonly unknown[] & LLMapperTypeParameters.Reversable<ReturnType<this['ParametersTypeInput']> extends readonly (infer I)[] ? I : never>>;
}
declare namespace LLMapperTypeParameters {
    /**
     * 自定义的符合数组原方法的对象，通过触发下面这种实例化警告
     *
     * > “this["ParametersType"]”可以使用与“...”无关的任意类型进行实例化。
     *
     * 来实现 LLMapper 内部的工具函数对 `this['ParametersType']` 的类型检查
     */
    interface Reversable<T> {
        reverse(): T[];
    }
    /**原键名是 K ，描述是 T 的情况下，得到新键名 */
    type NewKey<T extends LLMapper, K extends keyof any> = K extends string ? ReturnType<(T & {
        KeyType: K;
    })['newKey']> : K;
}
/**
 * 描述怎么把多语言对象映射为各种各样的函数对象的类
 *
 * `operation` 字段就是对象里具体的函数
 * 如果 `operation` 带泛型，不要指定 this 参数，否则泛型标签无法保留
 */
export declare abstract class LLMapper extends LLMapperTypeParameters {
    /**logtape 的日志器 */
    protected readonly logger: Logger;
    /**原多语言对象的键 */
    protected readonly key: this['KeyType'];
    /**新的键名 */
    abstract newKey(this: this): string;
    abstract operation(...parameters: [
        ...unknown[],
        ...this['ParametersType']
    ] | this['ParametersType']): unknown;
    constructor(
    /**多语言对象的键 */
    key: string, 
    /**logtape 的日志器 */
    logger: Logger, 
    /**多语言函数 */
    LLValue: (...parameters: any[]) => LocalizedString);
    /**多语言函数 */
    protected readonly LLValue: (...parameters: this['ParametersType']) => LocalizedString;
    /**内部安全运行函数 */
    protected safeRun<T>(run: () => T): T;
    /**
     * 把 `parameters` 代入到自己的多语言函数中
     * @returns `message` 是多语言字符串， `info` 是有用参数
     */
    protected localize(this: this, parameters: this['ParametersType']): {
        message: LocalizedString;
        info: Record<string, unknown>;
    };
}
/**根据描述，得到被映射的函数对象 */
export type Mapped<V extends FlatTranslationFunctions, T extends LLMapper> = {
    [K in keyof V as LLMapperTypeParameters.NewKey<T, K>]: OmitThisParameter<(T & {
        KeyType: K;
        ParametersTypeInput(): Parameters<Asserted<V[K], (...parameters: any[]) => any>>;
    })['operation']>;
};
/**
 * 把多语言对象映射为各种各样的函数对象
 * @param logger 日志器
 * @param LL 本模块的多语言对象
 * @param LLMapper 映射描述
 * @returns 被映射的函数对象
 */
export declare function mapLL<V extends FlatTranslationFunctions, T extends Deabstracted<typeof LLMapper>>(logger: Logger, LL: V, LLMapper: T): Mapped<V, InstanceType<T>>;
/**映射描述表 */
export type LLMappers = Record<string, Deabstracted<typeof LLMapper>>;
/**一堆描述堆起来的 */
export type WithMapped<V extends FlatTranslationFunctions, C extends LLMappers> = {
    [K in keyof C]: Mapped<V, InstanceType<C[K]>>;
};
/**把映射和包装器合并 */
export declare function mergeMapped<T extends {}, V extends FlatTranslationFunctions, C extends LLMappers>(logger: Logger, LL: V, object: T, mappers: C): T & WithMapped<V, C>;
export {};
