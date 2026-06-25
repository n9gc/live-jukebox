from typing import Any, AsyncIterable, Callable

handlers: dict[str, Callable[..., Any]] = {}


type HandlerOf[N: str, F: Callable[..., Any]] = Callable[[N], Callable[[F], F]]


def handler[T: Callable[..., Any]](name: str, /) -> Callable[[T], T]:
    def definer(fn: T):
        handlers[name] = fn
        return fn
    return definer


def service(name: str, /) -> Callable[[
    Callable[[AsyncIterable[Any]], AsyncIterable[Any]]
], None]:
    def definer(fn: Callable[[AsyncIterable[Any]], AsyncIterable[Any]]):
        pass
    return definer
