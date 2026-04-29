/**
 * 中文翻译文件
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/i18n/zh';

import type { Translation } from '../i18n-types';

const zh: Translation = {
	enumKeys: {
		CancelMethod_Blocking: '被播放中的歌曲阻塞',
		CancelMethod_Anyway: '强制取消',
		CancelMethod_ExceptPlaying: '绕开播放中的，取消后面那首',
		Command_Cancel: '取消歌曲',
		Command_Idk: '未知',
		Command_Song: '点一首歌',
		Meaning_ClientEnd: '客户端的一首歌放完了',
		Meaning_ServerPrompt: '来自服务端的提示',
		Meaning_ServerSongs: '服务端的歌曲列表',
		ResultOk_Ok: '一切安好',
		ResultPick_End: '所有歌都放完了',
		ResultPick_NoMusic: '歌单里没歌',
		ResultListAdd_SameId: '又点了 id 相同的一首歌',
		ResultListCancel_Playing: '正在播放中',
		ResultListCancel_NoCancelable: '没有可取消的',
		ResultListEnd_EndTooLate: '结束得太晚',
		ResultListEnd_EndTooEarly: '结束得太早',
	},
	enumNames: {
		CancelMethod: '在播放中取消时，{0}',
		Command: '点播指令{0}',
		Meaning: '通信消息{0}',
		ResultOk: '{0}',
		ResultPick: '自动点歌失败，{0}',
		ResultListAdd: '由于{0}，添加歌曲到歌单失败',
		ResultListCancel: '无法取消，{0}',
		ResultListEnd: '结束歌曲时，{0}',
	},
	i18n: {
		index: {
			langDetected: '成功检测语言：{locale}',
		},
		enum: {
			notEnum: '{symKey} 不是一个正常的枚举名称',
			notEnumKey: '{keyLL} 不是任何枚举的键，所有枚举的键：{keys|log_keys}',
			notEnumName: '{name} 不是任何枚举的名称，所有枚举的名称：{names|log_names}',
			noNameSymbol: '{sym|log_sym} 不是一个由 `Symbol.for` 得到的 symbol',
		},
	},
	jukebox: {
		autoPicker: {
			pickFailed: '由于 {result|enums} 导致备选点歌失败',
			picked: '自动点了 {playerName} 平台的 {title} 作为备选歌曲',
			typeChanged: '备选点歌模式改为 {pickType}',
		},
		parser: {
			someoneSaid: `{ignore|bool|{yes:（忽略）}}{uname}发弹幕说：{message}`,
			parseFailed: '无法作为 {previous|enums} 指令来解析：{message}',
			parsed: '得到一个 {type|enums} 类型的指令：{message}',
		},
		jukebox: {
			cancelFailed: '由于 {result|enums} 导致 {picker} 的取消失败了',
			canceled: '成功为 {picker} 取消了 {playerName} 平台的 {title}',
			picked: '{picker} 点歌了 {playerName} 平台的 {title}',
			sameSongAdded: '重复添加了同一首歌：{0|log_*}',
			songEnd: '{picker} 点播的 {playerName} 平台的 {title} 播完了',
			endWithWarn: '{title} 结束的问题是 {result|enums}',
			dispathList: '向客户端发送歌曲列表',
		},
	},
	player: {},
	reader: {},
	result: {},
	types: {
		enum: {
			markingObject: '正在标记 {name} 组',
			doubleDefined: '{sym|log_sym} 已经被定义了，请看：',
			definedHere: 'Defined here',
			markingSymbol: '正在定义 {sym|log_sym} 为 {name}.{key}',
			noNameSymbol: '{sym|log_sym} 不是一个由 `Symbol.for` 得到的 symbol',
		},
	},
	util: {},
};

export default zh;
