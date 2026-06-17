/**
 * i18n 的格式化器
 * @license MIT
 * @author n9gc
 */
import { createFormatters } from "tape-i18n/i18n/dynamic-formatter";
import { experimentalParseMessage, experimentalSerializeMessage } from "typesafe-i18n/parser";
import * as z from "zod";
function tapeFomatters(formatters) {
  return createFormatters(
    Object.assign(formatters, {
      /**用这个来隐藏需要的字段，但是类型上保证字段一定出现 */
      inError: () => "",
      /**不再需要手动指定参数名，直接 `{key: symbol|log}` 就行 */
      log: () => "",
      /**
       * 可以原封不动通过 logtape 输出的字符串
       *
       * 注意与 `log_*` 的区别：
       * - 这个输出的是普通字符串，而 `log_*` 是把字符串作为值来输出；
       * - 这个只能用于字符串，而 `log_*` 可以用于任何能被 logtape 输出的值。
       * @param message 字符串
       */
      rawLog(message) {
        return message.replaceAll("{", "{{").replaceAll("}", "}}");
      }
    }),
    {
      sign: ["log_", ""],
      /**
       * 添加可以用于 logtape 的函数
       * 只要 `{key: symbol|log_key}` 或者 `{obj: Info|log_obj}` 这样使用
       * `LoggerWrap` 就能通过 logtape 输出这些值，而不是简单用 i18n 拼接字符串
       */
      format: (key) => `{${key}}`
    }
  );
}
const initFormatters = (_) => {
  return tapeFomatters({});
};
function nameLogFormatter(LL) {
  for (const key of Object.keys(LL)) {
    const defination = z.string().parse(
      Object.getOwnPropertyDescriptor(LL, key)?.value
    );
    const parsed = experimentalParseMessage(defination);
    const added = parsed.map((part) => part.kind === "parameter" ? {
      ...part,
      transforms: part.transforms.map((pipe) => pipe.kind === "formatter" && pipe.name === "log" ? {
        ...pipe,
        name: `log_${part.key}`
      } : pipe)
    } : part);
    const target = experimentalSerializeMessage(added);
    LL[key] = target;
  }
  ;
}
export {
  initFormatters,
  nameLogFormatter,
  tapeFomatters
};
