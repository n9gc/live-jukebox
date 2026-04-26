/**
 * 播放器
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module './bili-player';

import { Player, registerPlayer, Song } from 'lib/player';
import { Danmaku } from 'lib/types';
import { JSX } from 'react';
import { getVideoInfo } from './api';
import { BiliInfo } from './types';

const bvRegexp = /^(BV[a-zA-Z0-9]{10})(?:_p(\d+))?$/;

/**B 站播放器 */
export default class BiliPlayer extends Player<'bili', typeof BiliInfo> {
	readonly playerName = 'bili';
	readonly infoSchema = BiliInfo;
	readonly desc = '发送“点歌<空格>BV号”可点播b站视频。可指定播放第几p，如 BV123_p3，未指定则播放所有p。';
	async parse({ message }: Danmaku): Promise<Song<'bili'> | undefined> {
		// 符合格式吗
		const match = bvRegexp.exec(message);
		if (!match) return void 0;

		const bvid = match[1];
		const page = match[2] ? Number.parseInt(match[2], 10) : void 0;
		const videoInfo = await getVideoInfo(bvid);
		if (!videoInfo) return void 0;
		return void 0;
	}
	PlayEle(song: Song<'bili'>): JSX.Element {
		return <h1>{song.title}</h1>;
	}
	TitleEle(song: Song<'bili'>): JSX.Element {
		return <div>{song.title} in {song.playerName}</div>;
	}
};

