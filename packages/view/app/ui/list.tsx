'use client';

/**
 * 歌曲列表
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module '@/app/ui/list';

import { DialogContext } from '@/app/lib/dialog';
import { Meaning, Dialog } from 'lib/types';
import { getId } from 'lib/util';
import { use, useEffect, useState } from 'react';

export default function List() {
	const [data, sendData] = use(DialogContext);
	const [dataList, setDataList] = useState<Dialog[]>([]);

	useEffect(() => setDataList(n => (data ? [...n, data] : n)), [data]);

	return <div>
		<pre>{
			dataList.map(data => Dialog.encode(data)).join('\n')
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

