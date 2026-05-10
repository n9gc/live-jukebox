import { configure, getConsoleSink } from '@logtape/logtape';
import { getPrettyFormatter } from '@logtape/pretty';
import { getAsyncLocalStorage } from 'lib/util';

// 配置 logtape
await configure({
	contextLocalStorage: await getAsyncLocalStorage<Record<string, unknown>>(),
	sinks: {
		console: getConsoleSink({
			formatter: getPrettyFormatter({
				timestamp: 'rfc3339',
				timestampStyle: 'italic',
				categoryStyle: 'dim',
				icons: false,
				level: 'FULL',
				inspectOptions: {
					depth: 5,
				},
			}),
		}),
	},
	loggers: [
		{
			category: [],
			lowestLevel: 'info',
			sinks: ['console'],
		},
		{
			category: ['logtape'],
			lowestLevel: 'error',
		},
	],
});

