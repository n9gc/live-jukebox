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
		noPyExe: 'Cannot find {pyExe: string|log}, use $PY_EXE instead.',
		initVenvFailed: 'init venv in {venvPath: string|log} failed',
		noPip: 'venv pip not found in {pipPath: string|log}',
		pipInstallFailed: 'pip install failed with {command: string[]|log}',
		noOperation: 'what do you want to do?',
	},
};

export default en;
