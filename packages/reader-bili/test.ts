import BiliReader from '.';

const reader = new BiliReader({
	roomId: 123,
});

reader.addListener(danmaku => {
	console.log(danmaku);
});
