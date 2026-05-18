/**
 * 服务端和客户端的通信语言
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/types/dialog';
const myPath = 'lib/types/dialog';

import { getJsonCodec, LocalizedString } from 'lib/types/defines';
import { Enumified, getSymbolCodec, mark } from 'lib/types/enum';
import { BaseSong } from 'lib/types/pure';
import { Eventer, getAsyncLocalStorage, initLogger, keyStartWith } from 'lib/util';
import * as z from 'zod';

const { log } = initLogger(myPath);

/**对话的意思 */
export type Meaning = Enumified<typeof Meaning>;
export namespace Meaning {
	/**我已放完歌曲 */
	export const ClientEnd = Symbol();
	/**当前歌单是什么 */
	export const ServerSongs = Symbol();
	/**服务器要显示的提示 */
	export const ServerPrompt = Symbol();
	mark({ Meaning });
}

/**服务端的意思 */
export const ServerMeanings = keyStartWith('Server', Meaning);
/**客户端的意思 */
export const ClientMeanings = keyStartWith('Client', Meaning);

/**方便地获取序列化器 */
function getCodec<T extends Meaning, D extends z.ZodType>(meaning: T, data: D) {
	return getJsonCodec(z.object({
		meaning: getSymbolCodec(meaning),
		data,
	}).readonly());
}

/**放完歌信息 */
export type ClientEnd = z.infer<typeof ClientEnd>;
export const ClientEnd = getCodec(
	Meaning.ClientEnd,
	BaseSong.readonly(),
);
/**歌单信息 */
export type ServerSongs = z.infer<typeof ServerSongs>;
export const ServerSongs = getCodec(
	Meaning.ServerSongs,
	z.array(BaseSong.readonly()).readonly(),
);

/**服务器的提示 */
export type ServerPrompt = z.infer<typeof ServerPrompt>;
export const ServerPrompt = getCodec(
	Meaning.ServerPrompt,
	LocalizedString,
);


/**信息 */
export type Dialog = z.infer<typeof Dialog>;
export const Dialog = z.union([
	ClientEnd,
	ServerSongs,
	ServerPrompt,
]);

/**对话事件表 */
export type DialogEvent = {
	[M in Meaning]: (Dialog & { meaning: M })['data'];
};

/**对话事件的异步上下文 */
const eventerStorage = await getAsyncLocalStorage<DialogEventer>();

/**对话事件 */
export class DialogEventer extends Eventer<DialogEvent> {
	/**
	 * 向客户端发送提示
	 * @param prompt 提示
	 */
	static prompt(prompt: LocalizedString) {
		const dialog = eventerStorage.getStore();
		if (!dialog) {
			log.error.promptFailed({ prompt });
			return;
		}
		dialog.dispatch(Meaning.ServerPrompt, prompt);
	}

	/**
	 * 带着当前对话上下文执行函数
	 * @param operation 函数
	 * @param parameters 函数的参数
	 */
	run<R, P extends any[]>(this: this, operation: (...parameters: P) => R, ...parameters: P) {
		return eventerStorage.run(
			this,
			operation,
			...parameters,
		);
	}

	override dispatch<T extends Meaning>(this: this, event: T, data: DialogEvent[T]): this {
		return this.run(() => super.dispatch(event, data));
	}
}

