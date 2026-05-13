/**
 * `tape-i18n` 的英文翻译文件
 * @license MIT
 * @author n9gc
 */
declare module '.';

import type { ModuleTranslation } from 'tape-i18n/types';
import type { BaseTranslation } from '../i18n-types';

const en: ModuleTranslation & BaseTranslation = {
	test: {
		hello: 'hello, {name: string}!',
	},
};

export default en;
