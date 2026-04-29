/**
 * i18n 所需要用到的外部类型
 * @license GPL-2.0-or-later
 * @author n9gc
 */
declare module 'lib/i18n/custom-types';

type ErrorImpl = Error;
export type { ErrorImpl as Error };

type symbolImpl = symbol;
export type { symbolImpl as symbol };

type EventImpl = Event;
export type { EventImpl as Event };
