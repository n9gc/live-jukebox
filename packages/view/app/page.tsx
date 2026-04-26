'use client';

/**
 * 主页面
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module '@/app/layout';

import { DialogContext, useDialog } from '@/app/lib/dialog';
import List from '@/app/ui/list';
import { useMemo } from 'react';


export default function Page() {
	const dialog = useDialog();
	const dialogValue = useMemo(() => dialog, dialog);

	return (
		<DialogContext value={dialogValue}>
			<List />
		</DialogContext>
	);
}
