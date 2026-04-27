/**
 * 中文翻译文件
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/i18n/zh';

import { Translation } from '../i18n-types';

const zh: Translation = {
	i18n: {
		langDetected: '成功检测语言：{locale}',
	},
	jukebox: {
		autoPicker: {
			pickFailed: '由于 {result} 导致备选点歌失败',
			picked: '自动点了 {playerName} 平台的 {title} 作为备选歌曲',
			typeChanged: '备选点歌模式改为 {pickType}',
		},
		parser: {
			someoneSaid: `{ignore|bool|{yes:（忽略）}}{uname}发弹幕说：{message}`,
			parseFailed: '无法作为 {previous} 指令来解析：{message}',
			parsed: '得到一个 {type} 类型的指令：{message}',
		},
		jukebox: {
			cancelFailed: '由于 {result} 导致 {picker} 的取消失败了',
			canceled: '成功为 {picker} 取消了 {playerName} 平台的 {title}',
			picked: '{picker} 点歌了 {playerName} 平台的 {title}',
			sameSongAdded: '重复添加了同一首歌：{?|star}',
			songEnd: '{picker} 点播的 {playerName} 平台的 {title} 播完了',
			endWithWarn: '{title} 结束的问题是 {result}',
			dispathList: '向客户端发送歌曲列表',
		},
	},
};

export default zh;
