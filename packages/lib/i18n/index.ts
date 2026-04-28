/**
 * 多语言选项
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/i18n';

export * from './enum';
export * from './formatters';
export * from './i18n-node';
export * from './i18n-react';
export { default as TypesafeI18n } from './i18n-react';
export * from './i18n-types';
export * from './i18n-util';
export * from './locale';

import type * as lib from 'lib';
import type { AllEnumTranslation } from './enum';
import { L } from './i18n-node';
import { locale } from './locale';

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
		/**基础库 */
		lib: typeof packageLL;
	}
	const globalLL: globalLL;
}


/**库的多语言对象 */
export const packageLL = L[locale];
/**如果没法访问全局，可以从这里拿到 */
export const globalLL: globalThis.globalLL = { lib: packageLL };
Reflect.set(globalThis, 'globalLL', globalLL);

/**库的多语言翻译对象 */
export type Base = AllEnumTranslation
	& Record<keyof typeof lib, Record<string, Record<string, string>>>;

// eslint-disable-next-line no-console
console.log(packageLL.i18n.index.langDetected({ locale }));


