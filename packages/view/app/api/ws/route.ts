/**
 * 激发点歌机的 dialogEventer 的 Web Socket 服务器
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module '@/app/api/ws/route';

import { dialogEventer, jukebox } from '@/app/lib/jukebox';
import { Dialog, ServerMeanings } from 'lib/types';
import type { WebSocket } from 'ws';
import * as z from 'zod';

export function UPGRADE(
	client: WebSocket,
) {
	client.on('message', message => {
		const r = Dialog.safeDecode(message.toString());
		if (!r.success) {
			console.error(z.prettifyError(r.error));
			return;
		}
		const { meaning, data } = r.data;
		dialogEventer.dispatch(meaning, data);
	});

	for (const meaning of ServerMeanings) {
		dialogEventer.addListener(
			meaning,
			data => client.send(Dialog.encode({ meaning, data } as any)),
		);
	}

	jukebox.dispatchSongs();
}
