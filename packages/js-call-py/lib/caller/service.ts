/**
 * 服务暴露的类型
 * @license MIT
 * @author n9gc
 */
declare module './service.ts';

import type { Listener } from 'lite-emit';
import { LiteEmit } from 'lite-emit';
import type { ServiceInfo } from './types.ts';


/**用于控制服务 */
export class Service<I extends ServiceInfo, O extends ServiceInfo> {
	/**输入输出事件 */
	protected readonly event = new LiteEmit<{
		input: [I['data']];
		output: [O['data']];
	}>();

	constructor(
		/**发送输入给服务 */
		send: (input: I['data']) => void,
		/**用于注册监听器函数的函数 */
		register: (listener: (output: O['data']) => void) => void,
	) {
		register(output => this.event.emit('output', output));
		this.event.on('input', send);
	}

	/**
	 * 给服务提供一个输入
	 * @param input 提供的输入
	 */
	emit(this: this, input: I['data']) {
		return this.event.emit('input', input);
	}

	/**
	 * 监听输出
	 * @param listener 监听器
	 * @returns 取消监听的函数
	 */
	on(this: this, listener: Listener<[O['data']]>) {
		return this.event.on('output', listener);
	}

	/**
	 * 就监听一次输出
	 * @param listener 监听器
	 * @returns 取消监听的函数
	 */
	once(this: this, listener: Listener<[O['data']]>) {
		return this.event.once('output', listener);
	}

	/**去除所有监听器 */
	off(this: this): void;
	/**
	 * 去除一个监听器
	 * @param listener 要去除的监听器
	 */
	off(this: this, listener: Listener<[O['data']]>): void;
	off(this: this, listener?: Listener<[O['data']]>) {
		return this.event.off('output', listener);
	}

	/**
	 * 以流式形式获得输出，正常情况下永远不会被迭代完
	 * 别忘了使用 `using` 来获得
	 * @returns 流式的输出
	 */
	streamOutput(this: this) {
		const outputs: (O['data'])[] = [];
		const waiters: PromiseWithResolvers<O['data']>[] = [];
		const off = this.on(output => {
			const waiter = waiters.shift();
			if (waiter) return waiter.resolve(output);
			outputs.push(output);
		});
		let isRunning = true;
		/**释放流 */
		function dispose() {
			off();
			isRunning = false;
			outputs.splice(0);
			for (const { reject } of waiters) {
				reject(new Error('Stream Disposed'));
			}
			waiters.splice(0);
		}
		const iter = (async function* () {
			while (isRunning) {
				if (outputs.length > 0) {
					yield outputs.shift()!;
					continue;
				}
				const waiter = Promise.withResolvers<O['data']>();
				waiters.push(waiter);
				yield waiter.promise;
			}
		})();
		return Object.assign(iter, {
			[Symbol.dispose]: dispose,
			[Symbol.asyncDispose]: async () => dispose(),
			dispose,
		});
	}
}

