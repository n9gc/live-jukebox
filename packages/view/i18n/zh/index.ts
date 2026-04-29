/**
 * 界面的中文翻译文件
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module '.';

import type { Translation } from '../i18n-types';

const zh: Translation = {
	server: {
		ws: {
			dialogTypeError: '对话类型错误\n{parseError}\n{message|log}',
		},
	},
	client: {
		dialog: {
			dialogTypeError: '对话类型错误\n{parseError}\n{message|log}',
			socketError: 'Web Socket 错误：{event|log}',
		},
	},
};

export default zh;
