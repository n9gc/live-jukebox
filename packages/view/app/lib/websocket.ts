'use client';

/**
 * 找到的
 * @link https://github.com/k0d13/next-ws/blob/main/examples/_shared/src/websocket.ts
 */
declare module '@/app/lib/websocket';

import { useEffect, useRef, useState } from 'react';

export function useWebSocket(url: () => string) {
	const ref = useRef<WebSocket>(null);
	const target = useRef(url);
	const [, update] = useState(0);

	useEffect(() => {
		if (ref.current) return;
		const socket = new WebSocket(target.current());
		Reflect.set(ref, 'current', socket);
		update(p => p + 1);
	}, []);

	return ref.current;
}
