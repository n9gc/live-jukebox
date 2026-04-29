/**
 * B 站弹幕读取器的中文翻译文件
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
	listen: {
		notPrepared: '没有 prepare ，找不到位于 {path|log} 的 {name|quote} ，尝试 pnpm i 来解决',
		cannotSpawn: '用参数 {config|log} 执行脚本 {pyScriptPath|log} 失败',
		wrongFormat: '输出格式错误：\n{parseError}\n{data|log}',
		errorWhileListen: '捕获点歌机错误 {error|log}',
	},
	blivedm: {
		processError: '进程错误 {error|log}',
		stderr: '错误流输出：{0}',
		exited: 'blivedm 已退出，返回：{code|log}',
	},
};

export default zh;
