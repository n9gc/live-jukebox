/**
 * 服务端和客户端的通信语言
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/types/dialog';

import { ResultPick } from 'lib/result';
import {
	Enumified,
	getEnumCodec,
	getSymbolCodec,
	mark,
	baseSongSchema,
	getJsonCodec,
} from 'lib/types';
import { Eventer } from 'lib/util';
import z from 'zod';

/**对话的意思 */
export type Meaning = Enumified<typeof Meaning>;
export namespace Meaning {
	/**求求服务端发我歌单 */
	export const ClientBeg = Symbol();
	/**我已放完歌曲 */
	export const ClientEnd = Symbol();
	/**当前歌单是什么 */
	export const ServerSongs = Symbol();
	mark({ Meaning });
}

/**求求信息解析器 */
export const DialogClientBegCodec = getJsonCodec(z.object({
	meaning: getSymbolCodec(Meaning.ClientBeg),
	data: z.null(),
}));
/**求求信息 */
export type DialogClientBeg = z.infer<typeof DialogClientBegCodec>;

/**放完歌信息解析器 */
export const DialogClientEndCodec = getJsonCodec(z.object({
	meaning: getSymbolCodec(Meaning.ClientEnd),
	data: baseSongSchema,
}));
/**放完歌信息 */
export type DialogClientEnd = z.infer<typeof DialogClientEndCodec>;

/**歌单信息解析器 */
export const DialogServerSongsCodec = getJsonCodec(z.object({
	meaning: getSymbolCodec(Meaning.ServerSongs),
	data: z.union([z.array(baseSongSchema), getEnumCodec(ResultPick)]),
}));
/**歌单信息 */
export type DialogServerSongs = z.infer<typeof DialogServerSongsCodec>;

/**信息解析器 */
export const DialogCodec = z.union([
	DialogClientBegCodec,
	DialogClientEndCodec,
	DialogServerSongsCodec,
]);
/**信息 */
export type Dialog = z.infer<typeof DialogCodec>;

/**对话事件表 */
export type DialogEvent = {
	[M in Meaning]: (Dialog & { meaning: M })['data'];
};

/**对话事件 */
export class DialogEventer extends Eventer<DialogEvent> { }

