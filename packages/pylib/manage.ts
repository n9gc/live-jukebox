/**
 * 对接 Python 库的开发脚本
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'pylib/manage';
const myPath = 'pylib/manage';

import { initLogger } from './i18n';
import { loadLogConfig } from './lib/utility';

await loadLogConfig();

const { thr } = initLogger(myPath);
const scripts: Partial<Record<string, () => void>> = {};

(
	scripts[process.argv.at(-1) ?? '']
	?? thr.noOperation
)();

