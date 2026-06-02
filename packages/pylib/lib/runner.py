"""
lib.runner
调度器
"""

from asyncio import (
    Future,
    Queue,
    Task,
    create_task,
    get_running_loop,
    run_coroutine_threadsafe,
)
import asyncio
from importlib import import_module
import json
from sys import stdin
import traceback
from typing import Any, Optional, override

from .base import BaseService, TaskManager


class Main(BaseService):
    """调度器"""

    def main_error(self, event: str, name: Optional[str] = None, **extra):
        """方便地输出错误"""
        extra['event'] = event
        if name is not None:
            extra['name'] = name
        self.out(**extra)

    def inter_error(self, service_name: str, info: str):
        """执行内部出现错误"""
        self.main_error(
            'uncaught',
            service_name,
            info=info,
        )

    def __init__(self) -> None:
        super().__init__(
            'main',
            Queue(),
            lambda: None,
            lambda info: self.inter_error('main', info),
        )
        self.services: dict[str, BaseService] = dict()
        """当前存活的服务"""
        self.loop = get_running_loop()
        """当前的事件循环"""
        self._input_queue: Queue[str] = Queue()
        """输入的字符串队列"""
        self.gotter_tasks = TaskManager()
        """正在接收信息的异步任务"""

        self._start_main_loop()

    _read_task: Optional[Future[None]]
    _print_task: Optional[Task[None]]
    _parse_task: Optional[Task[None]]

    def _start_main_loop(self):
        """开启主循环"""
        self._read_task = self.loop.run_in_executor(None, self._read)
        self._print_task = create_task(self.print())
        self._parse_task = create_task(self._parse())

    def _stop_main_loop(self):
        """停止主循环"""
        for task in (self._print_task, self._read_task, self._parse_task):
            if task is not None:
                task.cancel()

    def _read(self):
        """阻塞读取输入"""
        try:
            while True:
                line: Optional[str] = None
                try:
                    line = stdin.readline()
                finally:
                    if not line:
                        line = 'quit'
                    line = line.strip()
                if line == 'quit':
                    self._stop_main_loop()
                    break
                run_coroutine_threadsafe(
                    self._input_queue.put(str(line)),
                    self.loop,
                )
        except Exception:
            self.inter_error('main', traceback.format_exc())
        finally:
            self._read_task = None

    async def _parse(self):
        """解析每行输入"""
        try:
            while True:
                line = await self._input_queue.get()
                try:
                    arg = json.loads(line)
                except:
                    self.main_error(
                        'badInput',
                        line=line,
                        info=traceback.format_exc(),
                    )
                    continue
                self.gotter_tasks.add_task(self.got_message(arg))
        except Exception:
            self.inter_error('main', traceback.format_exc())
        finally:
            self._parse_task = None

    async def print(self):
        """输出信息"""
        try:
            while True:
                info = await self._out_queue.get()
                try:
                    line = json.dumps(info)
                except:
                    self.main_error(
                        'jsonOutFailed',
                        info['name'],
                        info=traceback.format_exc(),
                    )
                    continue
                print(line, flush=True)
        except Exception:
            self.inter_error('main', traceback.format_exc())
        finally:
            self._print_task = None

    @override
    async def stop(self):
        await super().stop()
        self._stop_main_loop()
        for task in (self._read_task, self._parse_task, self._print_task):
            if task is not None:
                await task
        await self.gotter_tasks.wait_tasks()
        await asyncio.gather(
            *(service.stop()
              for service in self.services.values()),
            return_exceptions=True,
        )

    service_cls_cache: dict[str, type[BaseService]] = dict()
    """缓存获取到的服务"""

    def get_service_cls(self, service_name: str):
        """获取服务"""
        cached = self.service_cls_cache.get(service_name)
        if cached is not None:
            return cached

        service_module = None
        try:
            service_module = import_module(service_name, '')
        except:
            return self.main_error(
                'noModule',
                service_name,
                info=traceback.format_exc(),
            )
        service_cls = getattr(service_module, 'Main', None)
        if service_cls is None:
            return self.main_error(
                'noMain',
                service_name,
                path=getattr(service_module, '__path__', 'unknown-path'),
            )
        if not isinstance(service_cls, type) or not issubclass(service_cls, BaseService):
            return self.main_error(
                'notService',
                service_name,
                path=getattr(service_module, '__path__', 'unknown-path'),
            )
        self.service_cls_cache[service_name] = service_cls
        return service_cls

    def get_service_ins(self, service_name: str):
        """获取运行中的服务"""
        running = self.services.get(service_name)
        if running is not None:
            return running

        service_cls = self.get_service_cls(service_name)
        if service_cls is None:
            return

        def unmount():
            poped = self.services.pop(service_name, service_ins)
            if poped != service_ins:
                self.services[service_name] = poped

        try:
            service_ins = service_cls(
                service_name,
                self._out_queue,
                unmount,
                lambda info: self.inter_error(service_name, info),
            )
        except:
            return self.main_error(
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
        if isinstance(arg, dict) and 'service' not in arg:
            return self.main_error('serviceNotProvided')
        service_name = str(arg['service'])

        service_ins = self.get_service_ins(service_name)
        if service_ins is None:
            return

        try:
            await service_ins.got_message(arg)
        except:
            return self.inter_error(
                service_name,
                traceback.format_exc(),
            )


if __name__ == '__main__':
    async def main():
        return Main()
    asyncio.run(main())
