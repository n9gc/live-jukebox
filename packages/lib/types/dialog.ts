/**
 * 服务端和客户端的通信语言
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/types/dialog';

import {
	ResultListCancel,
	ResultListEnd,
	ResultPick,
} from 'lib/result';
import { getJsonCodec } from 'lib/types/defines';
import {
	Enumified,
	getEnumCodec,
	getSymbolCodec,
	mark,
} from 'lib/types/enum';
import { BaseSong } from 'lib/types/pure';
import { Eventer } from 'lib/util';
import z from 'zod';

/**对话的意思 */
export type Meaning = Enumified<typeof Meaning>;
export namespace Meaning {
	/**我已放完歌曲 */
	export const ClientEnd = Symbol();
	/**当前歌单是什么 */
	export const ServerSongs = Symbol();
	/**歌曲结束的结果 */
	export const ServerEndResult = Symbol();
	/**取消的结果 */
	export const ServerCancelResult = Symbol();
	mark({ Meaning });
}

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
	z.union([
		z.array(BaseSong.readonly()).readonly(),
		getEnumCodec(ResultPick),
	]),
);

/**结束结果信息 */
export type ServerEndResult = z.infer<typeof ServerEndResult>;
export const ServerEndResult = getCodec(
	Meaning.ServerEndResult,
	getEnumCodec(ResultListEnd),
);

/**取消结果信息 */
export type ServerCancelResult = z.infer<typeof ServerCancelResult>;
export const ServerCancelResult = getCodec(
	Meaning.ServerCancelResult,
	z.union([
		BaseSong.readonly(),
		getEnumCodec(ResultListCancel),
	]),
);


/**信息 */
export type Dialog = z.infer<typeof Dialog>;
export const Dialog = z.union([
	ClientEnd,
	ServerSongs,
	ServerEndResult,
	ServerCancelResult,
]);

/**对话事件表 */
export type DialogEvent = {
	[M in Meaning]: (Dialog & { meaning: M })['data'];
};

/**对话事件 */
export class DialogEventer extends Eventer<DialogEvent> { }

