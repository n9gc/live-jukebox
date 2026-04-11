/**
 * 和 py 对接的类型
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module './types';

import z from 'zod';
import { Danmaku, getJsonCodec } from 'lib/types';

/**文本 */
export const DmTypeTexts = z.literal(0);
export type DmTypeTexts = z.infer<typeof DmTypeTexts>;
/**表情 */
export const DmTypeEmoji = z.literal(1);
export type DmTypeEmoji = z.infer<typeof DmTypeEmoji>;
/**语音 */
export const DmTypeVoice = z.literal(2);
export type DmTypeVoice = z.infer<typeof DmTypeVoice>;

/**弹幕类型 */
export const DmType = z.union([
	DmTypeTexts,
	DmTypeEmoji,
	DmTypeVoice,
]);
export type DmType = z.infer<typeof DmType>;

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

/**Py 传进来的 bili 弹幕 */
export const PyBiliDanmaku = getJsonCodec(BiliDanmaku.omit({ ignore: true }));
export type PyBiliDanmaku = z.infer<typeof PyBiliDanmaku>;
