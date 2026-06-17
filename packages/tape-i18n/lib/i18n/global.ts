/**
 * 多语言选项
 * @license MIT
 * @author n9gc
 */
declare module 'tape-i18n/i18n/global';

import { packageLL } from 'tape-i18n/i18n/locale';

declare global {
	/**
	 * 全局多语言对象
	 * 追加请用这种方式
	 * ```typescript
	 * declare global {
	 *   interface globalLL {
	 *     'some-pack': typeof packageLL;
	 *   }
	 * }
	 *
	 * const packageLL = L[locale];
	 * globalLL['some-pack'] = packageLL;
	 * ```
	 */
	interface globalLL {
		/**
		 * typesafe-i18n 和 tapelog 结合起来
		 * @license MIT
		 * @author accurtype
		 */
		'tape-i18n': typeof packageLL;
	}
	const globalLL: globalLL;
}

/**
 * 如果没法访问全局，可以从这里拿到
 * 而且以 type 而不是 interface 定义，类型上更收敛
 */
export type innerGlobalLL = { [I in keyof globalLL]: globalLL[I] };
export const innerGlobalLL: innerGlobalLL = { 'tape-i18n': packageLL } as any;
// eslint-disable-next-line unicorn/no-top-level-side-effects
Reflect.set(globalThis, 'globalLL', innerGlobalLL);

