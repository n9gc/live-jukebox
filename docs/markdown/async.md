# 异步队列模型

## 事件和监听器

- 无法控制顺序，适合无状态
- 可以重复激发

```ts
const eventer = new Eventer();

function beforeCall() {
    console.log('calling fn!');

    eventer.dispatch('call');
}

async function fn() {
    console.log('fn running!');

    eventer.dispatch('return');
}

function afterCall() {
    console.log('fn success!');
}

eventer.addListener('call', fn);
eventer.addListener('return', afterCall);
beforeCall();
```

## Promise 阻塞队列

- 可以阻塞，有顺序，状态清晰
- 简洁

```ts
let queue = Promise.resolve();
function addFn(fn: () => Promise<void>) {
    queue = queue
        .then(() => console.log('calling fn!'))
        .then(fn)
        .then(() => console.log('fn success!'));
}

async function fn() {
    console.log('fn running!');
}

addFn(fn);
```

## 等待列表

- 提供中断异步的功能，控制能力强
- 列表，能知道还剩多少异步函数

```ts
let now: (() => Promise<void>) | null = null;

function callEnd(cause: 'end' | 'break') {
	now = null;
	if (cause === 'end') {
		console.log('fn success!');
		endFn();
	} else {
		console.log('fn breaked!');
	}
}
function runFn(fn?: () => Promise<void>) {
	if (!fn || now === fn) return;
	if (now) callEnd('break');
	now = fn;
	console.log('calling fn!');
	fn().then(() => callEnd('end'));
}

const queue: (() => Promise<void>)[] = [];
function addFn(fn: () => Promise<void>) {
	queue.push(fn);
	runFn(queue.at(0));
}
function endFn() {
	queue.shift();
	runFn(queue.at(0));
}

async function fn() {
	console.log('fn running!');
}

addFn(fn);
```

