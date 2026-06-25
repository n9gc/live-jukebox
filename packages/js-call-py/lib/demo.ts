import * as z from 'zod';
import { Caller } from './caller/index.ts';
import { HandlerInputCodec, HandlerOutputCodec, ServiceInfoCodec } from './caller/types.ts';

const AddInputCodec = HandlerInputCodec('add', [z.number(), z.number()]);
const AddOutputCodec = HandlerOutputCodec('add', z.number());
const SuccInputCodec = HandlerInputCodec('succ', [z.number()]);
const SuccOutputCodec = HandlerOutputCodec('succ', z.number());

const AdderInputCodec = ServiceInfoCodec('adder', [
	z.tuple([z.literal('add'), z.number()]),
	z.tuple([z.literal('now')]),
]);
const AdderOutputCodec = ServiceInfoCodec('adder', [
	z.tuple([z.literal('now'), z.number(), z.literal('hello')]),
]);

const SuccerInputCodec = ServiceInfoCodec('succer', [
	z.tuple([z.literal('succ')]),
	z.tuple([z.literal('now')]),
]);
const SuccerOutputCodec = ServiceInfoCodec('succer', [
	z.tuple([z.literal('now'), z.number()]),
]);

export class CallerA extends Caller<
	z.infer<typeof AdderInputCodec | typeof SuccerInputCodec>,
	z.infer<typeof AdderOutputCodec | typeof SuccerOutputCodec>,
	z.infer<typeof AddInputCodec | typeof SuccInputCodec>,
	z.infer<typeof AddOutputCodec | typeof SuccOutputCodec>
> {
	protected readonly inputCodec = z.union([
		AddInputCodec,
		SuccInputCodec,
		AdderInputCodec,
		SuccerInputCodec,
	]);

	protected readonly outputCodec = z.union([
		AddOutputCodec,
		SuccOutputCodec,
		AdderOutputCodec,
		SuccerOutputCodec,
	]);
	readonly pythonScriptFile = 'abc';
	add(...inputs: z.infer<typeof AddInputCodec>['inputs']) {
		return this.handle('add', inputs);
	}
	succ(...inputs: z.infer<typeof SuccInputCodec>['inputs']) {
		return this.handle('succ', inputs);
	}

	readonly adder = this.getService('adder');
	readonly succer = this.getService('succer');
}

