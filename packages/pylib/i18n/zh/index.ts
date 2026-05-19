/**
 * 对接 Python 库的中文翻译文件
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module '.';

import type { Translation } from '../i18n-types';

const zh: Translation = {
	manage: {
		noPyExe: '找不到 {pyExe|log} ！用 $PY_EXE 来指定 python 路径',
		initVenvFailed: '位于 {venvPath|log} 初始化虚拟环境失败',
		noPip: '找不到位于 {pipPath|log} 的虚拟环境的 pip',
		pipInstallFailed: 'pip 用这些参数 {command|log} 安装失败',
		noOperation: '你没说要干啥',
	},
};

export default zh;
