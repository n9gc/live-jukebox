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
		noPyExe: 'Cannot find "{pyExe: string}", use $PY_EXE instead.',
		initVenvFailed: 'init venv in {venvPath: string} failed',
		noPip: 'venv pip not found in {pipPath: string}',
		pipInstallFailed: 'pip install failed with {command: string[]|join( )}',
		noOperation: 'what do you want to do?',
	},
	listen: {
		notPrepared: 'notPrepared, cannot find {name: string} in {path: string}. try running `pnpm i`',
		cannotSpawn: 'spawn python in {pyScriptPath: string} with {config: ListenDmConfig|log_config} failed',
		wrongFormat: 'data with wrong format:\n{parseError: string}\n{data: string}',
		errorWhileListen: 'catched jukebox error {error: unknown|log_error}',
	},
	blivedm: {
		processError: 'process error {error: Error|log_error}',
		stderr: 'stderr: {:string}',
		exited: 'blivedm exit: {code: number|log_code}',
	},
};

export default en;

