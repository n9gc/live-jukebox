/**
 * 对评论读取器的定义
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/reader';

import { Danmaku } from 'lib/types';

/**监听器 */
export type Listener = (danmaku: Danmaku) => void;

/**读取器 */
export abstract class Reader {
	/**绑定的监听器 */
	protected readonly listeners = new Set<Listener>();
	/**
	 * 添加一个监听器
	 * @param listener 监听器
	 */
	addListener(this: this, listener: Listener) {
		this.listeners.add(listener);
	}
	/**
	 * 把一个弹幕发给各个监听器
	 * @param danmaku 弹幕
	 */
	protected dispatch(this: this, danmaku: Danmaku) {
		for (const listener of this.listeners) {
			listener(danmaku);
		}
	}
	/**
	 * 删除一个监听器
	 * @param 要被删除的监听器
	 */
	removeListener(this: this, listener: Listener) {
		this.listeners.delete(listener);
	}
}

