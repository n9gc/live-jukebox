/**
 * ## 点歌机的公用库
 *
 * - `lib/jukebox` 是点歌机核心部分
 * - `lib/player` 是播放器相关
 * - `lib/reader` 是评论读取器相关
 * - `lib/result` 是操作的结果表示相关
 * - `lib/types` 是各种类型定义
 * - `lib/util` 是各种实用函数
 *
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib';

export * as jukebox from 'lib/jukebox';
export * as player from 'lib/player';
export * as reader from 'lib/reader';
export * as result from 'lib/result';
export * as types from 'lib/types';
export * as util from 'lib/util';

