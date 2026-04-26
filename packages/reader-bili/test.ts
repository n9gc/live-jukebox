import BiliReader from './lib';
import { loadLogConfig } from './lib/utility';

await loadLogConfig();

const reader = new BiliReader({
	roomId: 123,
});

reader.addListener('danmaku', danmaku => {
	console.log(danmaku);
});
