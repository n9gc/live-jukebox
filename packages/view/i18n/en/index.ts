/**
 * 界面的英文翻译文件
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module '.';

import type { ModuleTranslation } from 'tape-i18n/types';
import type { BaseTranslation } from '../i18n-types';

const en: BaseTranslation & ModuleTranslation = {
	api: {
		ws: {
			route: {
				dialogTypeError: 'not a correct dialog type\n{parseError: string}\n{message: string|log}',
			},
		},
	},
	lib: {
		dialog: {
			dialogTypeError: 'not a correct dialog type\n{parseError: string}\n{message: string|log}',
			socketError: 'socket error: {event: Event|log}',
		},
	},
};

export default en;

