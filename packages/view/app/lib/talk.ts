'use client';

import { useCallback, useEffect, useState } from 'react';
import { useWebSocket } from './websocket';
import z from 'zod';

export interface Message {
	author: string;
	content: string;
}

export function getUseDialog<T extends z.ZodType>(schema: T) {
	return (url: () => string) => {
		const socket = useWebSocket(url);
		const [data, setData] = useState<z.infer<T>[]>([]);

		useEffect(() => {
			const controller = new AbortController();

			socket?.addEventListener(
				'message',
				async event => {
					const payload = typeof event.data === 'string'
						? event.data
						: await event.data.text();
					try {
						const data = schema.parse(JSON.parse(payload));
						console.log('Incoming message:', data);
						setData(p => [...p, data]);
					} catch (error) {
						error;
					}
				},
				controller,
			);

			// socket?.addEventListener(
			// 	'error',
			// 	() => {
			// 		const content = 'An error occurred while connecting to the server';
			// 		setData((p) => [...p, { author: 'System', content }]);
			// 	},
			// 	controller,
			// );

			// socket?.addEventListener(
			// 	'close',
			// 	event => {
			// 		if (event.wasClean) return;
			// 	},
			// 	controller,
			// );

			return () => controller.abort();
		}, [socket]);

		const sendMessage = useCallback(
			(data: z.infer<T>) => {
				if (!socket || socket.readyState !== socket.OPEN) return;
				console.log('Outgoing message:', data);
				socket.send(JSON.stringify(data));
				setData(p => [...p, data]);
			},
			[socket],
		);

		return [data, sendMessage] as const;
	};
}
