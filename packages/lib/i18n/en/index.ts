/**
 * 英文翻译文件
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/i18n/en';

import { BaseTranslation } from '../i18n-types';

const en: BaseTranslation = {
	i18n: {
		langDetected: 'Dectected language: {locale: string}.',
	},
	jukebox: {
		autoPicker: {
			pickFailed: 'auto pick failed cause {result: ResultPick}',
			picked: 'auto pick a song named {title: string} of {playerName: string}',
			typeChanged: 'Change auto pick type to {pickType: PickType}',
		},
		parser: {
			someoneSaid: `{ignore: boolean|bool|{yes:(ignored) }}{uname: string} said: {message: string}`,
			parseFailed: 'idk, "{message: string}" is not a {previous: Command}',
			parsed: '"{message: string}" is a {type: Command}',
		},
		jukebox: {
			cancelFailed: '{picker: Picker} canceled and failed with {result: ResultListCancel}',
			canceled: '{picker: Picker} canceled song {title: string} of {playerName: string}',
			picked: 'A song of {playerName: string} named {title: string} picked by {picker: Picker}',
			sameSongAdded: 'Adding a same song {?|star}',
			songEnd: 'song named {title: string} of {playerName: string} picked by {picker: Picker} end',
			endWithWarn: '{title: string} end with {result: ResultListEnd}',
			dispathList: 'dispath song list',
		},
	},
};

export default en;

