/**
 * B 站弹幕读取器的中文翻译文件
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module '.';

import type { Translation } from '../i18n-types';

const zh: Translation = {
	listen: {
		notPrepared: '没有 prepare ，找不到位于 {path|log} 的 {name|quote} ，尝试 pnpm i 来解决',
		cannotSpawn: '用参数 {config|log} 执行脚本 {pyScriptPath|log} 失败',
		wrongFormat: '输出格式错误：\n{parseError}\n{data|log}',
		errorWhileListen: '捕获点歌机错误 {error|log}',
	},
	blivedm: {
		processError: '进程错误 {error|log}',
		stderr: '错误流输出：{0|rawLog}',
		exited: 'blivedm 已退出，返回：{code|log}',
	},
};

export default zh;
