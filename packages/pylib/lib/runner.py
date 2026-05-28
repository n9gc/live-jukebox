"""
lib.runner
调度器
"""

from asyncio import Lock, Queue, get_running_loop, run_coroutine_threadsafe
import asyncio
from importlib import import_module
import json
from sys import stdin
import traceback
from typing import Any, Callable, Optional, override

from .base import AVoid, BaseService, TaskManager


class Main(BaseService):
    """调度器"""

    def __init__(self, name: str, out_lock: Lock, unmount: Callable[[], AVoid], error: Callable[[str], AVoid]) -> None:
        super().__init__(name, out_lock, unmount, error)
        self.services: dict[str, BaseService] = dict()
        """当前存活的服务"""
        self._get_service_lock = Lock()
        """防止同时获取服务"""

    async def main_error(self, event: str, name: Optional[str] = None, **extra):
        """方便地输出错误"""
        extra['event'] = event
        if name is not None:
            extra['name'] = name
        await self.out(**extra)

    async def inter_error(self, service_name: str, info: str):
        """执行内部出现错误"""
        await self.main_error(
            'exception',
            service_name,
            info=info,
        )

    service_cls_cache: dict[str, type[BaseService]] = dict()
    """缓存获取到的服务"""

    async def get_service_cls(self, service_name: str):
        """获取服务"""
        cached = self.service_cls_cache.get(service_name)
        if cached is not None:
            return cached

        service_module = None
        try:
            service_module = import_module(service_name, '')
        except:
            return await self.main_error(
                'noModule',
                service_name,
                info=traceback.format_exc(),
            )
        service_cls = getattr(service_module, 'Main', None)
        if service_cls is None:
            return await self.main_error(
                'noMain',
                service_name,
                path=getattr(service_module, '__path__', 'unknown-path'),
            )
        if not isinstance(service_cls, type) or not issubclass(service_cls, BaseService):
            return await self.main_error(
                'notService',
                service_name,
                path=getattr(service_module, '__path__', 'unknown-path'),
            )
        self.service_cls_cache[service_name] = service_cls
        return service_cls

    async def get_service_ins(self, service_name: str):
        """获取运行中的服务"""
        service_cls = await self.get_service_cls(service_name)
        if service_cls is None:
            return

        async with self._get_service_lock:
            running = self.services.get(service_name)
            if running is not None:
                return running

            async def unmount():
                async with self._get_service_lock:
                    poped = self.services.pop(service_name, service_ins)
                    if poped != service_ins:
                        self.services[service_name] = poped

            try:
                service_ins = service_cls(
                    service_name,
                    self._out_lock,
                    unmount,
                    lambda info: self.inter_error(service_name, info),
                )
            except:
                return await self.main_error(
                    'badInstance',
                    service_name,
                    info=traceback.format_exc(),
                )
            self.services[service_name] = service_ins
            return service_ins

    @override
    async def got_message(self, arg: dict[str, Any]):
        """
        根据参数执行对应函数
        """
        try:
            arg = json.loads(arg['line'])
        except:
            return await self.main_error(
                'badInput',
                line=arg['line'],
            )
        if isinstance(arg, dict) and 'service' not in arg:
            return await self.main_error('serviceNotProvided')
        service_name = str(arg['service'])

        service_ins = await self.get_service_ins(service_name)
        if service_ins is None:
            return

        try:
            await service_ins.got_message(arg)
        except:
            return await self.inter_error(
                traceback.format_exc(),
                service_name,
            )


main_ins: Optional[Main] = None


async def unmount_main():
    """取消挂载调度器"""
    global main_ins
    main_ins = None


async def main():
    """
    在单独的线程中持续运行阻塞的input()，获取到输入后
    放入asyncio.Queue，由主协程处理。
    """
    global main_ins
    queue: Queue[str] = Queue()

    def blocking_reader():
        while True:
            line: Optional[str] = None
            try:
                line = stdin.readline()
            finally:
                if not line:
                    line = 'quit'
                line = line.strip()
            run_coroutine_threadsafe(
                queue.put(str(line)),
                loop,
            )
            if line == 'quit':
                break

    loop = get_running_loop()
    loop.run_in_executor(None, blocking_reader)

    async def main_error(info: str):
        if main_ins is None:
            return
        await main_ins.inter_error('main', info)

    main_ins = Main(
        'main',
        Lock(),
        unmount_main,
        main_error,
    )
    task_manager = TaskManager()
    while True:
        line = await queue.get()
        if line == 'quit':
            await main_ins.stop()
            await task_manager.wait_tasks()
            await asyncio.gather(
                *(service.stop() for service in main_ins.services.values()),
                return_exceptions=True,
            )
            break
        task_manager.add_task(main_ins.got_message({'line': line}))


if __name__ == '__main__':
    asyncio.run(main())
