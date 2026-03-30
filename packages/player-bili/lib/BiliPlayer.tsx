/**
 * 播放器
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module './BiliPlayer';

import { Player, Song } from 'lib/player';
import { Danmaku } from 'lib/types';
import { JSX } from 'react';
import { getVideoInfo } from './api';

const bvRegexp = /^(BV[a-zA-Z0-9]{10})(?:_p([0-9]+))?$/;

export default class BiliPlayer extends Player<'bili'> {
	readonly playerName = 'bili';
	readonly desc = '发送“点歌<空格>BV号”可点播b站视频。可指定播放第几p，如 BV123_p3，未指定则播放所有p。';
	async parse({ message }: Danmaku): Promise<Song<'bili'> | null> {
		// 符合格式吗
		const match = bvRegexp.exec(message);
		if (!match) return null;

		const bvid = match[1];
		const page = match[2] ? parseInt(match[2], 10) : null;
		const videoInfo = await getVideoInfo(bvid);
		if (!videoInfo) return null;
		return null;
	}
	PlayEle(song: Song<'bili'>): JSX.Element {
		return <h1>{song.title}</h1>;
	}
	TitleEle(song: Song<'bili'>): JSX.Element {
		return <div>{song.title} in {song.playerName}</div>;
	}
};


