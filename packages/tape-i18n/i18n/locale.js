/**
 * i18n 的语言判断相关
 * @license MIT
 * @author n9gc
 */
import { L } from "./i18n-node";
import { baseLocale, detectLocale, locales } from "./i18n-util";
const tapeI18nLocalesNow = [...locales];
const handler = {
  get(_, p) {
    const locale = detectLocale(() => tapeI18nLocalesNow);
    return Reflect.get(L[locale], p, L[locale]);
  }
};
const packageLL = new Proxy(L[baseLocale], handler);
export {
  packageLL,
  tapeI18nLocalesNow
};
