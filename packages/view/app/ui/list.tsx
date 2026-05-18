'use client';

/**
 * 歌曲列表
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module '#app/ui/list';

import { DialogContext } from '#app/lib/dialog';
import { Dialog, Meaning } from 'lib/types';
import { getId } from 'lib/util';
import { use } from 'react';

export default function List() {
	const [datas, sendData] = use(DialogContext);

	return <div>
		<pre>{
			datas.map(data => Dialog.encode(data)).join('\n')
		}</pre>
		<button onClick={() => sendData({
			meaning: Meaning.ClientEnd,
			data: {
				id: getId(),
				title: '321',
				playerName: 'bili',
				info: '234',
				picker: '345',
			},
		})}>
			omg
		</button>
	</div>;
}

