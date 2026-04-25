/**
 * B 站 API
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module './api';

import * as z from 'zod';

/**视频信息 */
export const VideoInfo = z.object({
	code: z.literal(0),
	message: z.literal('OK'),
	ttl: z.number(),
	data: z.array(z.object({
		cid: z.number(),
		page: z.number(),
	})),
}).readonly();
export type VideoInfo = z.infer<typeof VideoInfo>;

/**获取视频信息 */
export async function getVideoInfo(bvid: string): Promise<VideoInfo | null> {
	const res = await fetch(`https://api.bilibili.com/x/player/pagelist?bvid=${bvid}`);
	const json = await res.json();
	const parsed = VideoInfo.safeParse(json);
	return parsed.success ? parsed.data : null;
}
