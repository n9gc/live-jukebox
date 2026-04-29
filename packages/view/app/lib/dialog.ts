'use client';

/**
 * 沟通钩子和上下文
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module '@/app/lib/dialog';

import { initLogger } from '@/i18n';
import { Dialog } from 'lib/types';
import { createContext, useCallback, useEffect, useState } from 'react';
import * as z from 'zod';
import { useWebSocket } from './websocket';

const { log } = initLogger('view/client/dialog');

/**当前对话和发送对话的元组 */
export type DialogHandle = readonly [
	data: Dialog | undefined,
	sendData: (dataSent: Dialog) => void,
];
/**对话的上下文 */
export const DialogContext = createContext<DialogHandle>([void 0, () => void 0]);

/**和服务器通信，获得对话状态 */
export function useDialog(): DialogHandle {
	const socket = useWebSocket(() => `ws://${location.host}/api/ws`);
	const [data, setData] = useState<Dialog | undefined>(void 0);

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
				setData(r.data);
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

	return [data, sendData] as const;
};
