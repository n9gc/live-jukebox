/**
 * 激发点歌机的 dialogEventer 的 Web Socket 服务器
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module '@/app/api/ws/route';

import { dialogEventer, jukebox } from '@/app/lib/jukebox';
import { Dialog, Meaning } from 'lib/types';
import type { WebSocket } from 'ws';
import z from 'zod';

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

	([
		Meaning.ServerSongs,
		Meaning.ServerEndResult,
		Meaning.ServerCancelResult,
	] as const).forEach(meaning => {
		dialogEventer.addListener(
			meaning,
			data => client.send(Dialog.encode({ meaning, data } as any)),
		);
	});

	jukebox.dispatchSongs();
}
