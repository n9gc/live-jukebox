/**
 * 配置文件相关
 * @license MIT
 * @author n9gc
 */
declare module './index.ts';

import type { CallerConfig } from './types.ts';

export * from './types.ts';

/**
 * 带类型补全地定义配置
 * @param config 你的配置
 */
export function defineConfig<T extends CallerConfig>(config: T) {
	return config;
}
