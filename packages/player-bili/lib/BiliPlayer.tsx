/**
 * 播放器
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module './BiliPlayer';

import { Player } from 'lib/player';
import { Danmaku } from 'lib/types';
import { BiliInfo } from './info';
import { getVideoInfo } from './api';
import { JSX } from 'react';

const bvRegexp = /^(BV[a-zA-Z0-9]{10})(?:_p([0-9]+))?$/;

export class BiliPlayer extends Player<'bili'> {
	readonly name = 'bili';
	readonly desc = '发送“点歌<空格>BV号”可点播b站视频。可指定播放第几p，如 BV123_p3，未指定则播放所有p。';
	async parse({ message }: Danmaku): Promise<BiliInfo | null> {
		// 符合格式吗
		const match = bvRegexp.exec(message);
		if (!match) return null;

		const bvid = match[1];
		const pNumber = match[2] ? parseInt(match[2], 10) : null;
		const videoInfo = await getVideoInfo(bvid);
		if (!videoInfo) return null;
		return null;
	}
	PlayEle(info: BiliInfo): JSX.Element {
		return <h1>{info.title}</h1>;
	}
	TitleEle(info: BiliInfo): JSX.Element {
		return <div>{info.title} in {info.playerType}</div>;
	}
};


