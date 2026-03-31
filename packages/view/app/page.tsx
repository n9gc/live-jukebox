'use client';

import z from 'zod';
import { getUseDialog } from './lib/talk';

const useMessage = getUseDialog(z.string());

export default function SSEComponent() {
	const [message, sendMessage] = useMessage(
		() => `ws://${location.host}/api/test`,
	);

	return <div>
		{message.map(msg => <div>{msg}</div>)}
		<button onClick={() => sendMessage('abc')}>send</button>
	</div>;
}
