import { Metadata } from 'next';
import { WebSocketProvider } from 'next-ws/client';

export const metadata = {
	title: {
		default: '点歌机',
		template: '%s | 点歌机',
	},
} satisfies Metadata;

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="zh">
			<body>{children}</body>
		</html>
	);
}
