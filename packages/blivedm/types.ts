/**
 * py 给的信息的类型定义
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module './types';

export * from './dist/types-schema';

/**弹幕类型 */
export type DmType
	= DmTypeTexts
	| DmTypeEmoji
	| DmTypeVoice;
/**文本 */
export type DmTypeTexts = 0;
/**表情 */
export type DmTypeEmoji = 1;
/**语音 */
export type DmTypeVoice = 2;

/**弹幕 */
export interface Danmaku {
	/**毫秒时间戳 */
	readonly timestamp: number;
	/**弹幕类型 */
	readonly dmType: DmType;
	/**弹幕内容 */
	readonly message: string;
	/**用户ID */
	readonly uid: number;
	/**用户名 */
	readonly uname: string;
	/**用户头像URL */
	readonly face: string;
	/**是否房管 */
	readonly admin: boolean;
	/**是否月费老爷 */
	readonly vip: boolean;
	/**是否年费老爷 */
	readonly svip: boolean;
	/**用户等级 */
	readonly userLevel: number;
}


