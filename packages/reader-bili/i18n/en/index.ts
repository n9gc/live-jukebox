/**
 * B 站弹幕读取器的英文翻译文件
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module '.';

import type { ModuleTranslation } from 'lib/types';
import type { BaseTranslation } from '../i18n-types';

const en: BaseTranslation & ModuleTranslation = {
	manage: {
		noPyExe: 'Cannot find {pyExe: string|log}, use $PY_EXE instead.',
		initVenvFailed: 'init venv in {venvPath: string|log} failed',
		noPip: 'venv pip not found in {pipPath: string|log}',
		pipInstallFailed: 'pip install failed with {command: string[]|log}',
		noOperation: 'what do you want to do?',
	},
	listen: {
		notPrepared: 'notPrepared, cannot find {name: string|quote} in {path: string|log}. try running `pnpm i`',
		cannotSpawn: 'spawn python in {pyScriptPath: string|log} with {config: ListenDmConfig|log} failed',
		wrongFormat: 'data with wrong format:\n{parseError: string}\n{data: string|log}',
		errorWhileListen: 'catched jukebox error {error: unknown|log}',
	},
	blivedm: {
		processError: 'process error {error: Error|log}',
		stderr: 'stderr: {:string}',
		exited: 'blivedm exit: {code: number|log}',
	},
};

export default en;

