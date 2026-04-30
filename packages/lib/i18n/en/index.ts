/**
 * 英文翻译文件
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module '.';

import type { Base } from 'lib/i18n';

const en: Base = {
	enumKeys: {
		CancelMethod_Blocking: 'blocked by the playing',
		CancelMethod_Anyway: 'cancel anyway',
		CancelMethod_ExceptPlaying: 'cancel the next rather than the playing',
		Command_Cancel: 'Cancel the song',
		Command_Idk: 'Unknown command',
		Command_Song: 'Pick a song',
		Meaning_ClientEnd: 'Client\'s song finished',
		Meaning_ServerCancelResult: 'Result of cancel',
		Meaning_ServerEndResult: 'Result of song end',
		Meaning_ServerSongs: 'Server\'s list of songs',
		ResultOk_Ok: 'OK',
		ResultPick_End: 'all songs have finished',
		ResultPick_NoMusic: 'no song in the list',
		ResultListAdd_SameId: 'another song with the same id',
		ResultListCancel_Playing: 'cannot cancel while playing',
		ResultListCancel_NoCancelable: 'nothing to cancel',
		ResultListEnd_EndTooLate: 'end too late',
		ResultListEnd_EndTooEarly: 'end too early',
	},
	enumNames: {
		CancelMethod: 'While playing, {0: string}.',
		Command: 'Command:[{0: string}]',
		Meaning: 'Dialog Object:[{0: string}]',
		ResultOk: '{0: string}',
		ResultPick: 'Auto pick failed with: {0: string}.',
		ResultListAdd: 'Adding to list failed with: {0: string}.',
		ResultListCancel: 'Cancelling failed with: {0: string}.',
		ResultListEnd: 'Marking the song as ended with: {0: string}.',
	},
	i18n: {
		formatters: {
			quoted: '"{0: string}"',
		},
		index: {
			langDetected: 'Dectected language {locale: string|quote}.',
		},
		enum: {
			notEnum: '{symKey: string|log} is not a correct Enum.',
			notEnumKey: '{keyLL: string|log} is not key of any Enum.\n'
				+ 'Look the Error to see all keysll Enum keys.{keys: string[]|inError}',
			notEnumName: '{name: string|log} is not the name of any Enum.\n'
				+ 'Look the Error to see all keysll Enum keys.{names: string[]|inError}',
			noNameSymbol: 'The {sym: symbol|log} is not a symbol got by `Symbol.for`.',
		},
	},
	jukebox: {
		autoPicker: {
			pickFailed: '{result: ResultPick|enums}',
			picked: 'Auto pick a song named {title: string|quote} of {playerName: string|log}',
			typeChanged: 'Change auto pick type to {pickType: PickType|log}',
		},
		parser: {
			someoneSaid: `{ignore: boolean|bool|{yes:(ignored) }}{uname: string|log} said: {message: string|quote}.`,
			parseFailed: 'Idk, {message: string|quote} is not a {previous: Command|enums}',
			parsed: '"{message: string|quote}" is a {type: Command|enums}',
		},
		jukebox: {
			cancelFailed: '{picker: Picker|log} canceled and failed with {result: ResultListCancel|enums}',
			canceled: '{picker: Picker|log} canceled song {title: string|quote} of {playerName: string|log}',
			picked: 'A song of {playerName: string|log} named {title: string|quote} picked by {picker: Picker|log}',
			sameSongAdded: 'Adding a same song {song: Song|log}',
			songEnd: 'Song named {title: string|quote} of {playerName: string|log} picked by {picker: Picker|log} end',
			endWithWarn: 'For {title: string|quote}, {result: ResultListEnd|enums}',
			dispathList: 'Dispath song list',
		},
	},
	player: {},
	reader: {},
	result: {},
	types: {
		enum: {
			markingObject: 'Marking group: {name: string|log}',
			doubleDefined: 'Double defined {sym: symbol|log} in here:',
			definedHere: 'Defined here',
			markingSymbol: '{name: string}.{key: string} is {sym: symbol|log}',
			noNameSymbol: 'The {sym: symbol|log} is not a symbol got by `Symbol.for`',
		},
	},
	util: {},
};

export default en;

