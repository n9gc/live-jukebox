/**
 * 包装类的初始化和复用
 * @license MIT
 * @author n9gc
 */
import { innerGlobalLL } from "tape-i18n/i18n/global";
import { mergeMapped } from "tape-i18n/logger/llmapper";
import { LoggerWrap } from "tape-i18n/logger/wrap";
const memoried = /* @__PURE__ */ new WeakMap();
function getLoggerIniterWithLL(globalLL, mappers) {
  let wrapMap = memoried.get(globalLL);
  if (!wrapMap) {
    wrapMap = /* @__PURE__ */ new Map();
    memoried.set(globalLL, wrapMap);
  }
  return (scope) => {
    const memoriedWrap = wrapMap.get(scope);
    if (memoriedWrap) return memoriedWrap;
    class Wrap extends LoggerWrap {
    }
    const wrap = new Wrap(globalLL, scope);
    const merged = mergeMapped(wrap.logger, wrap.LL, wrap, mappers);
    wrapMap.set(scope, merged);
    return merged;
  };
}
function getLoggerIniter(mappers) {
  return getLoggerIniterWithLL(innerGlobalLL, mappers);
}
export {
  getLoggerIniter,
  getLoggerIniterWithLL
};
