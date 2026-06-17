/**
 * 多语言相关的类型
 * @license MIT
 * @author n9gc
 */
import * as z from "zod";
const FlatTranslationFunctions = z.record(z.string(), z.function({
  input: z.array(z.any()),
  output: z.any()
}));
const FlatTranslation = z.record(z.string(), z.string());
export {
  FlatTranslation,
  FlatTranslationFunctions
};
