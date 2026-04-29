/**
 * i18n 的格式化器
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module './formatters';

import { getForattersIniter } from 'lib/i18n';
import { Formatters } from './i18n-types';

export const initFormatters = getForattersIniter<Formatters>();

