'use client';

/**
 * 沟通钩子和上下文
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module '#app/lib/dialog';
const myPath = '#app/lib/dialog';

import { useWebSocket } from '#app/lib/websocket';
import { initLogger } from '@/i18n';
import { Dialog } from 'lib/types';
import { createContext, useCallback, useEffect, useState } from 'react';
import * as z from 'zod';

const { log } = initLogger(myPath);

/**当前对话和发送对话的元组 */
export type DialogHandle = readonly [
	datas: readonly Dialog[],
	sendData: (dataSent: Dialog) => void,
];
/**对话的上下文 */
export const DialogContext = createContext<DialogHandle>([[], () => void 0]);

/**和服务器通信，获得对话状态 */
export function useDialog(historyNumber: number): DialogHandle {
	const socket = useWebSocket(() => `ws://${location.host}/api/ws`);
	const [datas, setData] = useState<readonly Dialog[]>([]);

	useEffect(() => {
		const controller = new AbortController();

		socket?.addEventListener(
			'message',
			async event => {
				const message: string = typeof event.data === 'string'
					? event.data
					: await event.data.text();
				const r = Dialog.safeDecode(message);
				if (!r.success) {
					log.error.dialogTypeError({
						message,
						parseError: z.prettifyError(r.error),
					});
					return;
				}
				setData(n => [r.data, ...n.slice(0, historyNumber)]);
			},
			controller,
		);

		socket?.addEventListener(
			'error',
			event => {
				log.error.socketError({ event });
			},
			controller,
		);

		socket?.addEventListener(
			'close',
			event => {
				if (event.wasClean) return;
			},
			controller,
		);

		return () => controller.abort();
	}, [socket]);

	const sendData = useCallback(
		(dataSent: Dialog) => {
			if (!socket || socket.readyState !== socket.OPEN) return;
			socket.send(Dialog.encode(dataSent));
		},
		[socket],
	);

	return [datas, sendData] as const;
};
