/**
 * 界面的英文翻译文件
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module '.';

import type { ModuleTranslation } from 'lib/types';
import type { BaseTranslation } from '../i18n-types';

const en: BaseTranslation & ModuleTranslation = {
	server: {
		ws: {
			dialogTypeError: 'not a correct dialog type\n{parseError: string}\n{message: string}',
		},
	},
	client: {
		dialog: {
			dialogTypeError: 'not a correct dialog type\n{parseError: string}\n{message: string}',
			socketError: 'socket error: {event: Event|log_event}',
		},
	},
};

export default en;

