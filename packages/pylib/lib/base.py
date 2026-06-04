"""
lib.base
基类的定义
"""

from abc import ABC, abstractmethod
from asyncio import Queue, Task, create_task, gather
import traceback
from typing import Any, Awaitable, Coroutine


class Outable(ABC):
    """可以输出信息的"""

    @property
    @abstractmethod
    def _name(self) -> str:
        """模块被调用时的名称，不要手动实现它"""

    @property
    @abstractmethod
    def _out_queue(self) -> Queue[dict[str, Any]]:
        """输出队列，不要手动实现它"""

    def out(self, **info):
        """输出信息"""
        if 'service' not in info:
            info['service'] = self._name
        self._out_queue.put_nowait(info)


class BaseService(Outable, ABC):
    """服务基类"""

    def __init__(self) -> None:
        self._error_no = 0
        """长期运行函数的错误数量"""
        self.max_error_no = 200
        """长期运行函数的最大错误数量，防止循环错误"""

    @abstractmethod
    def _unmount(self):
        """取消注册服务，不要手动实现它"""

    @abstractmethod
    def _error(self, info: str, /):
        """报错函数，不要手动实现它"""

    def catch_joined(self, joined: Awaitable[Any], restart: Awaitable[Any]):
        """捕获长期运行函数里的错误"""
        async def catcher():
            try:
                await joined
            except Exception:
                self._error_no += 1
                self._error(traceback.format_exc())
                if self._error_no < self.max_error_no:
                    try:
                        await restart
                    except Exception:
                        self._error(traceback.format_exc())
        create_task(catcher())

    @abstractmethod
    async def got_message(self, arg: dict[str, Any], /):
        """
        新的消息进入
        注意这个函数不能是一个死循环
        别忘了使用 `self.catch_joined`
        """
        pass

    async def stop(self):
        """终止服务"""
        self._unmount()


class TaskManager:
    """管理分散的任务"""

    def __init__(self) -> None:
        self._tasks_running: set[Task[None]] = set()
        """所有正在执行的任务"""

    def add_task(self, task: Coroutine[Any, Any, Any] | Task[Any], /):
        """添加一个任务"""
        if not isinstance(task, Task):
            task = create_task(task)
        self._tasks_running.add(task)
        task.add_done_callback(lambda task: self._tasks_running.remove(task))

    async def wait_tasks(self):
        """等待所有任务完成"""
        return await gather(*self._tasks_running, return_exceptions=True)
