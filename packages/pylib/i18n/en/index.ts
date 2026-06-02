/**
 * 对接 Python 库的英文翻译文件
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module '.';

import type { ModuleTranslation } from 'tape-i18n/types';
import type { BaseTranslation } from '../i18n-types';

const en: BaseTranslation & ModuleTranslation = {
	manage: {
		noOperation: 'what do you want to do?',
	},
};

export default en;
