/**
 * 日志包装器
 * @license MIT
 * @author n9gc
 */
declare module 'tape-i18n/logger/wrap';
import { Logger, LogLevel } from '@logtape/logtape';
import { LLMapper, WithMapped } from 'tape-i18n/logger/llmapper';
import { AllPathsOf, Asserted, FlatTranslationFunctions, ModuleTranslationFunctions, Visited } from 'tape-i18n/types';
/**日志器的描述 */
declare namespace log {
    /**对应等级的方法对象描述 */
    abstract class LLLogMapper extends LLMapper {
        abstract readonly level: LogLevel;
        newKey: () => this["KeyType"];
        /**
         * 把对应多语言字符串通过 logtape 输出
         * @param parameters 对应的多语言函数的参数
         */
        operation(...parameters: this['ParametersType']): void;
    }
    /**追踪等级的日志 */
    export class trace extends LLLogMapper {
        readonly level = "trace";
    }
    /**调试等级的日志 */
    export class debug extends LLLogMapper {
        readonly level = "debug";
    }
    /**提示等级的日志 */
    export class info extends LLLogMapper {
        readonly level = "info";
    }
    /**警告等级的日志 */
    export class warning extends LLLogMapper {
        readonly level = "warning";
    }
    /**警告等级的日志 */
    export class warn extends LLLogMapper {
        readonly level = "warning";
    }
    /**错误等级的日志 */
    export class error extends LLLogMapper {
        readonly level = "error";
    }
    /**致命等级的日志 */
    export class fatal extends LLLogMapper {
        readonly level = "fatal";
    }
    export {};
}
/**被索引到的模块的多语言函数 */
export type VisitedLL<T extends ModuleTranslationFunctions, P extends string> = Asserted<Visited<T, Asserted<P, AllPathsOf<T>>, '/'>, FlatTranslationFunctions>;
/**把 logtape 和 i18n 一起包装起来 */
export declare abstract class LoggerWrap<T extends ModuleTranslationFunctions = ModuleTranslationFunctions, P extends string = string> {
    /**全局的 LL */
    readonly globalLL: T;
    /**模块的名称 */
    readonly scope: P;
    readonly logger: Logger;
    readonly LL: VisitedLL<T, P>;
    /**日志器 */
    log: WithMapped<VisitedLL<T, P>, typeof log>;
    constructor(
    /**全局的 LL */
    globalLL: T, 
    /**模块的名称 */
    scope: P);
}
export {};
