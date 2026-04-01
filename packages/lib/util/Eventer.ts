/**
 * 事件订阅器
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/util/Eventer';

/**监听器 */
export type Listener<T> = (n: T) => void;

/**事件订阅器 */
export default class Eventer<O> {
	/**绑定的监听器 */
	protected readonly listenerMap: { [I in keyof O]?: Set<Listener<O[I]>>; } = Object.create(null);
	/**
	 * 添加一个监听器
	 * @param event 事件
	 * @param listener 监听器
	 */
	addListener<T extends keyof O>(this: this, event: T, listener: Listener<O[T]>) {
		(this.listenerMap[event]
			?? (this.listenerMap[event] = new Set())
		).add(listener);
	}
	/**
	 * 把一个数据发给各个监听器
	 * @param event 事件
	 * @param data 数据
	 */
	dispatch<T extends keyof O>(this: this, event: T, data: O[T]) {
		this.listenerMap[event]?.forEach(listener => listener(data));
	}
	/**
	 * 删除一个监听器
	 * @param event 事件
	 * @param listener 要被删除的监听器
	 */
	removeListener<T extends keyof O>(this: this, event: T, listener: Listener<O[T]>) {
		this.listenerMap[event]?.delete(listener);
	}
}

