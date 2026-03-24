import { fibonacci } from '@accurtype/mono-test-wasm';
/**
 * 得到一个问候
 * @param n 要问候斐波那契数列的第几项
 * @returns 问候
 */
export default function hello(n) {
    const str = `hello, ${fibonacci(n)}!`;
    console.log(str);
    return str;
}
