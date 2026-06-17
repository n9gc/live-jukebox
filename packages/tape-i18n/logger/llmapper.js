/**
 * 把多语言对象映射为各种函数对象相关工具
 * @license MIT
 * @author n9gc
 */
import * as z from "zod";
const string = z.string();
class LLMapperTypeParameters {
  /**原多语言对象的键的类型。不要把它用作值 */
  KeyType = "";
  /**用来惰性接受原多语言对象参数类型。不要以任何形式使用它 */
  ParametersTypeInput(n) {
    return n;
  }
  /**原多语言对象的参数的类型。不要把它用作值 */
  ParametersType = [];
}
class LLMapper extends LLMapperTypeParameters {
  constructor(key, logger, LLValue) {
    super();
    this.logger = logger;
    this.key = key;
    this.LLValue = LLValue;
  }
  logger;
  /**原多语言对象的键 */
  key;
  /**多语言函数 */
  LLValue;
  /**内部安全运行函数 */
  safeRun(run) {
    try {
      return run();
    } catch (error) {
      this.logger.fatal("logging fatal");
      throw error;
    }
  }
  /**
   * 把 `parameters` 代入到自己的多语言函数中
   * @returns `message` 是多语言字符串， `info` 是有用参数
   */
  localize(parameters) {
    const first = parameters.at(0);
    const isObject = first && typeof first === "object" && first.constructor === Object;
    const info = parameters.length === 1 && isObject ? first : parameters;
    return this.safeRun(() => {
      const message = this.LLValue(...parameters);
      string.parse(message);
      return { message, info };
    });
  }
}
function mapLL(logger, LL, LLMapper2) {
  const logObject = {};
  const keys = Object.keys(LL);
  for (const key of keys) {
    const llMapper = new LLMapper2(key, logger, LL[key]);
    const mappedKey = llMapper.newKey();
    logObject[mappedKey] = (...parameters) => llMapper.operation(...parameters);
  }
  return logObject;
}
function mergeMapped(logger, LL, object, mappers) {
  const keys = Object.keys(mappers);
  for (const key of keys) {
    const mapped = mapLL(logger, LL, mappers[key]);
    object[key] = mapped;
  }
  return object;
}
export {
  LLMapper,
  mapLL,
  mergeMapped
};
