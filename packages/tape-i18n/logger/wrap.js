/**
 * 日志包装器
 * @license MIT
 * @author n9gc
 */
import { getLogger } from "@logtape/logtape";
import { nameLogFormatter } from "tape-i18n/i18n/formatters";
import { LLMapper, mergeMapped } from "tape-i18n/logger/llmapper";
import {
  FlatTranslationFunctions,
  visit
} from "tape-i18n/types";
import * as z from "zod";
var log;
((log2) => {
  class LLLogMapper extends LLMapper {
    newKey = () => this.key;
    /**
     * 把对应多语言字符串通过 logtape 输出
     * @param parameters 对应的多语言函数的参数
     */
    operation(...parameters) {
      const { message, info: info2 } = this.localize(parameters);
      this.logger[this.level](message, info2);
    }
  }
  ;
  class trace extends LLLogMapper {
    level = "trace";
  }
  log2.trace = trace;
  class debug extends LLLogMapper {
    level = "debug";
  }
  log2.debug = debug;
  class info extends LLLogMapper {
    level = "info";
  }
  log2.info = info;
  class warning extends LLLogMapper {
    level = "warning";
  }
  log2.warning = warning;
  class warn extends LLLogMapper {
    level = "warning";
  }
  log2.warn = warn;
  class error extends LLLogMapper {
    level = "error";
  }
  log2.error = error;
  class fatal extends LLLogMapper {
    level = "fatal";
  }
  log2.fatal = fatal;
})(log || (log = {}));
class LoggerWrap {
  constructor(globalLL, scope) {
    this.globalLL = globalLL;
    this.scope = scope;
    this.logger = getLogger(scope.split("/"));
    const visited = visit(globalLL, scope, "/");
    const result = FlatTranslationFunctions.safeParse({ ...visited });
    if (!result.success) {
      const error = z.prettifyError(result.error);
      throw new Error("not a correct scope\n" + error, { cause: { globalLL, scope, visited } });
    }
    this.LL = visited;
    nameLogFormatter(this.LL);
    this.log = mergeMapped(this.logger, this.LL, {}, log);
  }
  globalLL;
  scope;
  logger;
  LL;
  /**日志器 */
  log;
}
export {
  LoggerWrap
};
