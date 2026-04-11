/**
 * 服务端最先执行的内容
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module './instrumentation';

/**注册函数 */
export async function register() {
	await import('config/logtape.config');
}


