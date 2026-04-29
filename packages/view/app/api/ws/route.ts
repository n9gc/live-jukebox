/**
 * 激发点歌机的 dialogEventer 的 Web Socket 服务器
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module '@/app/api/ws/route';

import { dialogEventer, jukebox } from '@/app/lib/jukebox';
import { initLogger } from '@/i18n';
import { Dialog, ServerMeanings } from 'lib/types';
import type { WebSocket } from 'ws';
import * as z from 'zod';

const { log } = initLogger('view/server/ws');

export function UPGRADE(
	client: WebSocket,
) {
	client.on('message', rawMessage => {
		const message = rawMessage.toString();
		const r = Dialog.safeDecode(message);
		if (!r.success) {
			log.error.dialogTypeError({
				message,
				parseError: z.prettifyError(r.error),
			});
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
