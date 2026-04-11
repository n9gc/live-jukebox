import 'config/logtape.config';
import BiliReader from './lib';

const reader = new BiliReader({
	roomId: 123,
});

reader.addListener('danmaku', danmaku => {
	console.log(danmaku);
});
