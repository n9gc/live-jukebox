/**
 * 多语言选项
 * @license MIT
 * @author n9gc
 */
import { packageLL } from "tape-i18n/i18n/locale";
const innerGlobalLL = { "tape-i18n": packageLL };
Reflect.set(globalThis, "globalLL", innerGlobalLL);
export {
  innerGlobalLL
};
