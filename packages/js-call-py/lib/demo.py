import asyncio
from typing import Any, AsyncIterable, Callable, Coroutine, Literal, Tuple, overload

from bind import handler as handler_import, service as service_import


@overload
def handler[T: Callable[[int, int], int]](
    name: Literal['add'], /,
) -> Callable[[T], T]: ...


@overload
def handler[T: Callable[[int], int]](
    name: Literal['succ'], /,
) -> Callable[[T], T]: ...


def handler(name: str, /):
    return handler_import(name)


AdderInput = Tuple[Literal['add'], int] | Tuple[Literal['now']]
AdderOutput = Tuple[Literal['now'], int, Literal['hello']]


@overload
def service(
    name: Literal['adder'], /,
) -> Callable[[
    Callable[
        [AsyncIterable[AdderInput]],
        AsyncIterable[AdderOutput],
    ]
], None]: ...


SuccerInput = Tuple[Literal['succ']] | Tuple[Literal['now']]
SuccerOutput = Tuple[Literal['now'], int]


@overload
def service(
    name: Literal['succer'], /,
) -> Callable[[
    Callable[
        [AsyncIterable[SuccerInput]],
        AsyncIterable[SuccerOutput],
    ]
], None]: ...


def service(name: str):
    return service_import(name)


@handler('add')
def add(a: int, b: int) -> int:
    c = a + b
    return c


@handler('succ')
def succ(n: int) -> int:
    return n + 1


def catch_task[T](*tasks: asyncio.Task[Any], queue: asyncio.Queue[None | T]) -> Callable[[], Coroutine[Any, Any, None]]:
    """把任务都绑在主队列里，如果任务抛出错误则 put None"""
    def catcher(task: asyncio.Task[None]):
        if task.exception() is not None:
            asyncio.create_task(queue.put(None))
    for task in tasks:
        task.add_done_callback(catcher)

    async def clean():
        for task in tasks:
            task.cancel()
        await asyncio.gather(*tasks, return_exceptions=True)
    return clean


@service('adder')
async def adder(in_stream: AsyncIterable[AdderInput]) -> AsyncIterable[AdderOutput]:
    operation: asyncio.Queue[int | Literal['now'] | None] = asyncio.Queue()

    async def read_in():
        async for msg in in_stream:
            match msg:
                case ('add', n):
                    await operation.put(n)
                case ('now',):
                    await operation.put('now')
        raise Exception()

    clean = catch_task(
        asyncio.create_task(read_in()),
        queue=operation,
    )

    now = 0
    try:
        while True:
            match await operation.get():
                case 'now':
                    yield ('now', now, 'hello')
                case None:
                    return
                case n:
                    now = now + n
    finally:
        await clean()


@service('succer')
async def succer(in_stream: AsyncIterable[SuccerInput]) -> AsyncIterable[SuccerOutput]:
    now = 0
    async for n in in_stream:
        match n:
            case ('now',):
                yield ('now', now)
            case ('succ',):
                now += 1
