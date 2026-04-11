'use client';

/**
 * 沟通钩子和上下文
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module '@/app/lib/dialog';

import { createContext, useCallback, useEffect, useState } from 'react';
import { useWebSocket } from './websocket';
import z from 'zod';
import { Dialog } from 'lib/types';

/**当前对话和发送对话的元组 */
export type DialogHandle = readonly [
	data: Dialog | null,
	sendData: (dataSent: Dialog) => void,
];
/**对话的上下文 */
export const DialogContext = createContext<DialogHandle>([null, () => void 0]);

/**和服务器通信，获得对话状态 */
export function useDialog(): DialogHandle {
	const socket = useWebSocket(() => `ws://${location.host}/api/ws`);
	const [data, setData] = useState<Dialog | null>(null);

	useEffect(() => {
		const controller = new AbortController();

		socket?.addEventListener(
			'message',
			async event => {
				const payload: string = typeof event.data === 'string'
					? event.data
					: await event.data.text();
				const r = Dialog.safeDecode(payload);
				if (!r.success) {
					console.error(z.prettifyError(r.error));
					return;
				}
				setData(r.data);
			},
			controller,
		);

		socket?.addEventListener(
			'error',
			event => {
				console.error(event);
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

	return [data, sendData] as const;
};
