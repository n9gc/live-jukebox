import { JukeboxConfig } from 'lib/jukebox';
import { BiliPlayer } from 'player-bili';
import BiliReader from 'reader-bili';

/**点歌机配置 */
const jukeboxConfig = {
	readers: [new BiliReader({ roomId: 123 })],
	players: [new BiliPlayer()],
} satisfies JukeboxConfig;

export default jukeboxConfig;

