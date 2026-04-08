/**
 * 配置定义实用工具
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/util/config';

/**配置的初始化器 */
export interface ConfigIniter extends Record<string, () => unknown> { }

/**初始化后的配置 */
export type Inited<T extends ConfigIniter> = { [K in keyof T]: ReturnType<T[K]> };
/**用户可以提供的配置 */
export type Configable<T extends ConfigIniter> = Partial<Inited<T>>;

/**得到初始化器对应的配置补全函数 */
export function getConfigGetter<T extends ConfigIniter>(initer: T): (config: Configable<T>) => Inited<T> {
	const keys: readonly (keyof T)[] = Object.keys(initer);
	return (config: Configable<T>) => {
		const result: Configable<T> = {};
		for (const key of keys) {
			const value: any = key in config && config[key] !== void 0
				? config[key]
				: initer[key]();
			result[key] = value;
		}
		return result as { [K in keyof T]: ReturnType<T[K]> };
	};
}

