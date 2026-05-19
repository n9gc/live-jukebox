/**
 * B 站弹幕读取器的英文翻译文件
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module '.';

import type { ModuleTranslation } from 'tape-i18n/types';
import type { BaseTranslation } from '../i18n-types';

const en: BaseTranslation & ModuleTranslation = {
	listen: {
		notPrepared: 'notPrepared, cannot find {name: string|quote} in {path: string|log}. try running `pnpm i`',
		cannotSpawn: 'spawn python in {pyScriptPath: string|log} with {config: ListenDmConfig|log} failed',
		wrongFormat: 'data with wrong format:\n{parseError: string}\n{data: string|log}',
		errorWhileListen: 'catched jukebox error {error: unknown|log}',
	},
	blivedm: {
		processError: 'process error {error: Error|log}',
		stderr: 'stderr: {:string|rawLog}',
		exited: 'blivedm exit: {code: number|log}',
	},
};

export default en;

