'use client';

/**
 * 主页面
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module '@/app/layout';

import { DialogContext, useDialog } from '@/app/lib/dialog';
import List from '@/app/ui/list';
import Prompts from '@/app/ui/prompts';
import { useMemo } from 'react';


export default function Page() {
	const dialog = useDialog(50);
	const dialogValue = useMemo(() => dialog, [dialog[0]]);

	return (
		<DialogContext value={dialogValue}>
			<List />
			<Prompts timeoutMs={2000} />
		</DialogContext>
	);
}
