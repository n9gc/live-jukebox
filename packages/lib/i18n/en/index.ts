/**
 * 英文翻译文件
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/i18n/en';

import type { Base } from 'lib/i18n';

const en: Base = {
	enums: {
		CancelMethod_Blocking: 'Blocked by the playing',
		CancelMethod_Anyway: 'Cancel anyway',
		CancelMethod_ExceptPlaying: 'Cancel except playing',
		Command_Cancel: 'Cancel the song',
		Command_Idk: 'Unknown command',
		Command_Song: 'Pick a song',
		Meaning_ClientEnd: 'A song finished',
		Meaning_ServerCancelResult: 'Result of cancel',
		Meaning_ServerEndResult: 'Result of song end',
		Meaning_ServerSongs: 'The list of songs',
		ResultOk_Ok: 'OK',
		ResultPick_End: 'All songs finished',
		ResultPick_NoMusic: 'No song in the list',
		ResultListAdd_SameId: 'Picking a same song',
		ResultListCancel_Playing: 'Has been blocked by the playing',
		ResultListCancel_NoCancelable: 'Nothing to cancel',
		ResultListEnd_EndTooLate: 'End too late',
		ResultListEnd_EndTooEarly: 'End too early',
	},
	i18n: {
		index: {
			langDetected: 'Dectected language: {locale: string}.',
		},
		enum: {
			notEnumKey: '{nameKey: string} is not key of any Enum. All Enum keys: {keys: string[]|log_keys}',
			noNameSymbol: 'The {sym: symbol|log_sym} is not a symbol got by `Symbol.for`',
		},
	},
	jukebox: {
		autoPicker: {
			pickFailed: 'Auto pick failed cause {result: ResultPick|enums}',
			picked: 'Auto pick a song named {title: string} of {playerName: string}',
			typeChanged: 'Change auto pick type to {pickType: PickType}',
		},
		parser: {
			someoneSaid: `{ignore: boolean|bool|{yes:(ignored) }}{uname: string} said: {message: string}`,
			parseFailed: 'Idk, "{message: string}" is not a {previous: Command|enums}',
			parsed: '"{message: string}" is a {type: Command|enums}',
		},
		jukebox: {
			cancelFailed: '{picker: Picker} canceled and failed with {result: ResultListCancel|enums}',
			canceled: '{picker: Picker} canceled song {title: string} of {playerName: string}',
			picked: 'A song of {playerName: string} named {title: string} picked by {picker: Picker}',
			sameSongAdded: 'Adding a same song {0|log_*}',
			songEnd: 'Song named {title: string} of {playerName: string} picked by {picker: Picker} end',
			endWithWarn: '{title: string} end with {result: ResultListEnd|enums}',
			dispathList: 'Dispath song list',
		},
	},
	player: {},
	reader: {},
	result: {},
	types: {
		enum: {
			markingObject: 'Marking group: {name: string}',
			doubleDefined: 'Double defined {sym: symbol|log_sym} in here:',
			definedHere: 'Defined here',
			markingSymbol: '{name: string}.{key: string} is {sym: symbol|log_sym}',
			noNameSymbol: 'The {sym: symbol|log_sym} is not a symbol got by `Symbol.for`',
		},
	},
	util: {},
};

export default en;

