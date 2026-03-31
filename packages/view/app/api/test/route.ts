import type { WebSocket, WebSocketServer } from 'ws';
import type { IncomingMessage } from 'http';

export function UPGRADE(
	client: WebSocket,
	server: WebSocketServer,
) {
	console.log('✅ 客户端已连接');

	client.on('message', message => {
		console.log('📨 收到消息:', message.toString());
		// 将消息原样返回给客户端
		client.send(message);
	});

	client.on('close', () => {
		console.log('❌ 客户端已断开');
	});
}
