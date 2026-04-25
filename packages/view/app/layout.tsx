/**
 * 布局
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module '@/app/layout';

import { Metadata } from 'next';

export const metadata = {
	title: {
		default: '点歌机',
		template: '%s | 点歌机',
	},
} satisfies Metadata;

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="zh">
			<body>{children}</body>
		</html>
	);
}
