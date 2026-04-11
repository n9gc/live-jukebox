import { configure, getConsoleSink } from '@logtape/logtape';
import { getPrettyFormatter } from '@logtape/pretty';

// 配置 logtape
await configure({
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

