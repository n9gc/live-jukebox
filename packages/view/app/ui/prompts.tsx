'use client';

/**
 * 提示列表
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module '#app/ui/prompts';

import { DialogContext } from '#app/lib/dialog';
import { LocalizedString, Meaning, ServerPrompt } from 'lib/types';
import { use, useState } from 'react';

/**单个提示 */
export function Prompt({
	prompt,
}: {
	prompt: LocalizedString;
}) {
	return <div>{prompt}</div>;
}

interface PromptInfo {
	readonly prompt: LocalizedString;
	readonly time: Date;
}

/**提示列表 */
export default function Prompts({
	timeoutMs,
}: {
	timeoutMs: number;
}) {
	const [datas] = use(DialogContext);
	const [lastData, setLastData] = useState<ServerPrompt | undefined>(void 0);
	const [list, setList] = useState<readonly PromptInfo[]>([]);
	const dataNow = datas.at(0);
	if (
		dataNow
		&& lastData !== dataNow
		&& dataNow.meaning === Meaning.ServerPrompt
	) {
		setLastData(dataNow);
		const { data: prompt } = dataNow;
		setList(n => [{ prompt, time: new Date() }, ...n]);
		setTimeout(() => setList(n => n.slice(0, -1)), timeoutMs);
	}

	return <>
		{list.map(({ prompt, time }) => {
			const key = `${time.toString()}:${time.getMilliseconds()}`;
			return <Prompt prompt={prompt} key={key} />;
		})}
	</>;
}

