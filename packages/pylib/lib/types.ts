/**
 * 和 py 对接的类型
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'pylib/types';

import { Danmaku, getJsonCodec } from 'lib/types';
import * as z from 'zod';
import * as Schema from '../dist/types-schema';

/**监听 B 站弹幕的参数 @zod */
export interface ArgumentBiliListen {
	/**要调用的功能 */
	readonly callee: 'bili_listen';
	/**直播房间 URL 上面的 id */
	readonly roomId: bigint;
	/**
	 * 已登录账号的 cookie 的 SESSDATA 字段的值
	 * 不填也可以连接，但是收到弹幕的用户名会打码，UID会变成0
	 * > 如果你是从 `Chrome开发者工具 - 应用` 复制cookie的，不要勾选“显示已解码的网址”
	 */
	readonly sessData?: string;
}
export const ArgumentBiliListen = Schema.ArgumentBiliListen;

/**文本 @zod */
export type DmTypeTexts = 0;
export const DmTypeTexts = Schema.DmTypeTexts;
/**表情 @zod */
export type DmTypeEmoji = 1;
export const DmTypeEmoji = Schema.DmTypeEmoji;
/**语音 @zod */
export type DmTypeVoice = 2;
export const DmTypeVoice = Schema.DmTypeVoice;
/**弹幕类型 @zod */
export type DmType
	= DmTypeTexts
	| DmTypeEmoji
	| DmTypeVoice;
export const DmType = Schema.DmType;

/**bili 弹幕 */
export const BiliDanmaku = Danmaku
	.safeExtend({
		/**弹幕类型 */
		dmType: DmType,
		/**用户ID */
		uid: z.number(),
		/**是否房管 */
		admin: z.boolean(),
		/**是否月费老爷 */
		vip: z.boolean(),
		/**是否年费老爷 */
		svip: z.boolean(),
		/**用户等级 */
		userLevel: z.number(),
	});
export type BiliDanmaku = z.infer<typeof BiliDanmaku>;

/**Py 获取 bili 弹幕得到的事件数据 */
export const DataBiliListen = getJsonCodec(BiliDanmaku.omit({
	ignore: true,
	readerName: true,
}));
export type DataBiliListen = z.infer<typeof DataBiliListen>;

/**参数类型 @zod */
export type Argument
	= ArgumentBiliListen;
export const Argument = Schema.Argument;

