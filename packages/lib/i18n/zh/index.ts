/**
 * 中文翻译文件
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module '.';

import type { Translation } from '../i18n-types';

const zh: Translation = {
	enumKeys: {
		CancelMethod_Blocking: '被播放中的歌曲阻塞',
		CancelMethod_Anyway: '强制取消',
		CancelMethod_ExceptPlaying: '绕开播放中的，取消后面那首',
		Command_Cancel: '取消',
		Command_Idk: '未知',
		Command_Songs: '点歌',
		Meaning_ClientEnd: '客户端的一首歌放完了',
		Meaning_ServerPrompt: '服务端给客户端的消息',
		Meaning_ServerSongs: '服务端的歌曲列表',
		CommonPickerException_End: '所有歌都放完了',
		CommonPickerException_NoMusic: '歌单里没歌',
	},
	enumNames: {
		CancelMethod: '在播放中取消时，{0}',
		Command: '弹幕指令 [{0}] ',
		Meaning: '通信消息 [{0}] ',
		CommonPickerException: '{0}',
	},
	i18n: {
		formatters: {
			quoted: '「{0}」',
			quotedSpliter: '',
		},
		index: {
			langDetected: '成功检测语言：{locale|quote}。',
		},
		enum: {
			notEnum: '{symKey|log} 不是一个正常的枚举名称。',
			notEnumKey: '{keyLL|log} 不是任何枚举的键，所有枚举的键请见报错。{keys|inError}',
			notEnumName: '{name|log} 不是任何枚举的名称，所有枚举的名称请见报错。{names|inError}',
			noNameSymbol: '{sym|log} 不是一个由 `Symbol.for` 得到的 symbol 。',
		},
	},
	jukebox: {
		'auto-picker': {
			pickFailed: '自动点歌失败，因为{result|enums}。',
			picked: '自动点了 {playerName|log} 平台的{title|quote}作为备选歌曲。',
			typeChanged: '备选点歌模式改为 {pickType|log}。',
			autoPicker: '自动点歌机',
		},
		parser: {
			someoneSaid: `{ignore|bool|{yes:（忽略）}}{uname|log}发弹幕说：{message|quote}。`,
			parseFailed: '无法作为{previous|enums}指令来解析：{message|quote}。',
			parsed: '得到一个{type|enums}：{message|quote}。',
		},
		index: {
			dispathList: '向客户端发送歌曲列表',
		},
		'song-list': {
			sameSongAdded: '重复添加了同一首歌：{song|log}。',
			picked: '{picker|log} 点歌了 {playerName|log} 平台的 {title|quote}。',
			songEnd: '{picker|log} 点播的 {playerName|log} 平台的 {title|quote} 播完了。',
			endTooLate: '这首歌{title|quote}播放结束得过晚。',
			endTooEarly: '这首歌{title|quote}播放结束得过早。将它前面这 {songs|length} 首歌{songs|quotes}全部取消。',
			cancelWhilePlaying: '不能取消正在播放的歌曲，{pickerDisplay|rawLog}的取消失败。',
			noCancelable: '{pickerDisplay|rawLog}没有可以取消的歌曲。',
			canceled: '{pickerDisplay|rawLog}取消了歌曲{title|quote}。',
		},
	},
	player: {},
	reader: {},
	types: {
		enum: {
			markingObject: '正在标记 {name|log} 组',
			doubleDefined: '{sym|log} 已经被定义了，请看：{definedPosition|inError}',
			definedHere: '在这里定义',
			markingSymbol: '正在定义 {sym|log} 为 {name}.{key}',
			noNameSymbol: '{sym|log} 不是一个由 `Symbol.for` 得到的 symbol',
		},
		dialog: {
			promptFailed: '无法获取上下文的对话对象，无法向客户端提示 {prompt|log}',
		},
	},
	util: {},
};

export default zh;
