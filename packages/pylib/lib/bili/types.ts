/**
 * b 站相关类型
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'pylib/bili/types';

import { Danmaku, getJsonCodec } from 'lib/types';
import { registerPylibTypes } from 'pylib/type-global';
import * as z from 'zod';
import * as Schema from '../../dist/lib-bili-types';
import * as self from './types';

declare global {
	namespace PylibTypes {
		/**B 站相关 */
		export import bili = self;
	}
}

registerPylibTypes('bili', self);

/**监听 B 站弹幕模块的信息 @zod */
export interface Base {
	/**服务所在的模块 */
	readonly service: 'lib.bili.listen';
	/**操作 */
	readonly operation: string;
}
import Base = Schema.Base;

/**启动参数 @zod */
export interface ArgumentOpen extends Base {
	readonly operation: 'open';
	/**直播房间 URL 上面的 id */
	readonly roomId: string;
	/**
	 * 已登录账号的 cookie 的 SESSDATA 字段的值
	 * 不填也可以连接，但是收到弹幕的用户名会打码，UID会变成0
	 * > 如果你是从 `Chrome开发者工具 - 应用` 复制cookie的，不要勾选“显示已解码的网址”
	 */
	readonly sessData?: string;
}
export import ArgumentOpen = Schema.ArgumentOpen;

/**关闭参数 @zod */
export interface ArgumentClose extends Base {
	readonly operation: 'close';
	/**直播房间 URL 上面的 id */
	readonly roomId: string;
}
export import ArgumentClose = Schema.ArgumentClose;

/**监听 B 站弹幕的参数 @zod */
export type Argument
	= ArgumentOpen
	| ArgumentClose;
export const Argument = getJsonCodec(Schema.Argument);

/**文本 @zod */
export type DmTypeTexts = 0;
export import DmTypeTexts = Schema.DmTypeTexts;
/**表情 @zod */
export type DmTypeEmoji = 1;
export import DmTypeEmoji = Schema.DmTypeEmoji;
/**语音 @zod */
export type DmTypeVoice = 2;
export import DmTypeVoice = Schema.DmTypeVoice;
/**弹幕类型 @zod */
export type DmType
	= DmTypeTexts
	| DmTypeEmoji
	| DmTypeVoice;
export import DmType = Schema.DmType;

/**Py 获取 bili 弹幕得到的事件数据 */
export const DataDanmaku = Base
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
	})
	.and(
		Danmaku.omit({
			ignore: true,
			readerName: true,
		}),
	)
	.readonly()
	.meta({ id: 'DataDanmaku' });
export type DataDanmaku = z.infer<typeof DataDanmaku>;

/**监听 B 站弹幕可能的返回值 */
export const Data = getJsonCodec(z.union([
	DataDanmaku,
])).meta({ id: 'Data' });
export type Data = z.infer<typeof Data>;

/**bili 弹幕 */
export const BiliDanmaku = DataDanmaku.and(Danmaku).readonly();
export type BiliDanmaku = z.infer<typeof BiliDanmaku>;

