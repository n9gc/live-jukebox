import { getLogger } from '@logtape/logtape';
import BiliReader from './lib';
import { loadLogConfig } from './lib/utility';
import { Danmaku } from 'lib/types';

await loadLogConfig();

const logger = getLogger(['reader-bili', 'test']);

const reader = new BiliReader({
	roomId: 123,
});

reader.addListener('danmaku', danmaku => {
	const a: Pick<Danmaku, keyof Danmaku> = danmaku;
	logger.info(a);
});
