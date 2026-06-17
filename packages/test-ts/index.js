/**
 * 测试用的 TS 包
 * @license MIT
 * @author accurtype
 */
import { fibonacci } from "@accurtype/mono-test-wasm";
function hello(n) {
  const helloString = `hello, ${fibonacci(n)}!`;
  return helloString;
}
export {
  hello as default
};
