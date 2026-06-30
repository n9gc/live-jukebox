/**
 * 调用器通用部分
 * @license MIT
 * @author n9gc
 */
declare module './index.ts';

import { LiteEmit } from 'lite-emit';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import type { Readable } from 'node:stream';
import * as z from 'zod';
import type {
	HandlerInput,
	HandlerOutput,
	Service,
	ServiceEventMap,
	ServiceInfo,
} from './types.ts';

export * from './types.ts';

/**对 Python 进程的钩子函数 */
export interface Hooks<
	SI extends ServiceInfo,
	SO extends ServiceInfo,
	HI extends HandlerInput,
	HO extends HandlerOutput,
> {
	/**当进程对象有错误出现时 */
	readonly onError?: (error: Error) => void;
	/**当进程关闭时 */
	readonly onClose?: (code: number | null, signal: NodeJS.Signals | null) => void;
	/**读取标准错误流 */
	readonly getStderr?: (stderr: Readable) => void;
	/**Python 进程输出无法被解析时的处理 */
	readonly onWrongOutput?: (data: string, error: z.ZodError<SO | HO>) => void;
	/**JS 输入无法被解析时的处理 */
	readonly onWrongInput?: (data: SI | HI, error: z.ZodError<string>) => void;
}

/**这个类型只用来在不知道 schema 的情况下描述一个类型的 {@link z.ZodCodec} */
interface Codec<T> {
	safeDecode(n: string):
		| { success: true; data: T }
		| { success: false; error: z.ZodError<T> };
	safeEncode(n: T):
		| { success: true; data: string }
		| { success: false; error: z.ZodError<string> };
}

/**控制一个 Python 进程的调用器 */
export abstract class Caller<
	SI extends ServiceInfo,
	SO extends ServiceInfo,
	HI extends HandlerInput,
	HO extends HandlerOutput,
> {
	/**用于编码所有输入 */
	protected abstract readonly inputCodec: Codec<SI | HI>;
	/**用于解码所有输出 */
	protected abstract readonly outputCodec: Codec<SO | HO>;
	/**启动 python 的入口文件 */
	abstract readonly pythonScriptFile: string;

	/**捕获一些事件的钩子 */
	protected readonly hooks: Hooks<SI, SO, HI, HO>;
	/**进程对象 */
	readonly proce: ChildProcessWithoutNullStreams;

	/**为了防止 ts 报错说不能在构造函数里使用抽象属性 */
	private getPythonScriptFile() {
		return this.pythonScriptFile;
	}

	/**
	 * @param hooks 捕获一些事件的钩子
	 */
	constructor(hooks: Hooks<SI, SO, HI, HO>) {
		this.hooks = hooks;
		this.proce = spawn('uv', ['run', this.getPythonScriptFile()]);

		if (hooks.onError) this.proce.on('error', hooks.onError);
		if (hooks.onClose) this.proce.on('close', hooks.onClose);
		hooks.getStderr?.(this.proce.stderr);

		const rl = createInterface({
			input: this.proce.stdout,
			terminal: false,
		});

		rl.on('line', data => {
			const r = this.outputCodec.safeDecode(data);
			if (!r.success) {
				if (hooks.onWrongOutput) hooks.onWrongOutput(data, r.error);
				return;
			}
			const output = r.data;
			if (output.type === 'service') {
				this.serviceResolverMap.get(output.name)?.(output.data);
			} else {
				this.handlerResolverMap.get(`${output.name}@${output.callId}`)?.(output);
			}
		});
	}

	/**向 Python 进程发送数据 */
	protected send(data: SI | HI) {
		const r = this.inputCodec.safeEncode(data);
		if (!r.success) {
			if (this.hooks.onWrongInput) this.hooks.onWrongInput(data, r.error);
			return;
		}
		this.proce.stdin.write(r.data);
	}

	/**异步函数每次调用的输出接收函数 */
	protected readonly handlerResolverMap = new Map<`${HO['name']}@${bigint}`, (data: HO) => void>();
	/**每个异步函数的调用 id 库 */
	private readonly idMap = new Map<HI['name'], bigint>();
	/**
	 * 调用异步函数
	 * @param name 异步函数的名字
	 * @param inputs 异步函数的参数
	 * @returns 异步函数的返回值
	 */
	protected async handle<N extends HI['name']>(name: N, inputs: Extract<HI, { name: N }>['inputs']) {
		const callId = this.idMap.get(name) ?? 0n;
		this.idMap.set(name, callId + 1n);
		const { promise, resolve } = Promise.withResolvers<HO>();
		const key = `${name}@${callId}` as const;
		this.handlerResolverMap.set(key, n => {
			this.handlerResolverMap.delete(key);
			resolve(n);
		});
		this.send({
			type: 'handler',
			name,
			callId,
			inputs,
		} as Extract<HI, { name: N }>);
		const data = await promise;
		return data.output as Extract<HO, { name: N }>['output'];
	}

	/**服务每个事件的输出接收器函数 */
	protected readonly serviceResolverMap = new Map<SO['name'], (data: SO['data']) => void>();
	/**
	 * 获得一个服务事件
	 * @param name 服务的名称
	 * @returns 服务的事件，可用于随意跟服务交流
	 */
	protected getService<N extends SI['name']>(name: N):
	Service<Extract<SI, { name: N }>, Extract<SO, { name: N }>> {
		const inputer = new LiteEmit<ServiceEventMap<Extract<SI, { name: N }>['data']>>();
		inputer.on('*', (...data: Extract<SI, { name: N }>['data']) => {
			this.send({
				type: 'service',
				name,
				data,
			} as Extract<SI, { name: N }>);
		});
		const outputer = new LiteEmit<ServiceEventMap<Extract<SO, { name: N }>['data']>>();
		this.serviceResolverMap.set(name, (data: readonly unknown[]) => (inputer.emit as any)(...data));
		return {
			emit: inputer.emit.bind(inputer),
			on: outputer.on.bind(outputer),
			off: outputer.off.bind(outputer),
			once: outputer.once.bind(outputer),
		};
	}
}

