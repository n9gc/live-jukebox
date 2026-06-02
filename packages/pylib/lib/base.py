"""
lib.base
基类的定义
"""

from abc import ABC, abstractmethod
from asyncio import Queue, Task, create_task, gather
import traceback
from typing import Any, Awaitable, Callable, Coroutine, override


class BaseService(ABC):
    """服务基类"""

    def __init__(
            self,
            name: str,
            out_queue: Queue[dict[str, Any]],
            unmount: Callable[[], None],
            error: Callable[[str], None]
    ) -> None:
        self.name = name
        """模块被调用时的名称"""
        self._out_queue = out_queue
        """输出队列"""
        self._unmount = unmount
        """取消注册服务"""
        self.error = error
        """报错函数"""
        self._error_no = 0
        """长期运行函数的错误数量"""
        self.max_error_no = 200
        """长期运行函数的最大错误数量，防止循环错误"""

    def out(self, **info):
        """输出信息"""
        if 'service' not in info:
            info['service'] = self.name
        self._out_queue.put_nowait(info)

    def catch_joined(self, joined: Awaitable[Any], restart: Awaitable[Any]):
        """捕获长期运行函数里的错误"""
        async def catcher():
            try:
                await joined
            except:
                self._error_no += 1
                self.error(traceback.format_exc())
                if self._error_no < self.max_error_no:
                    await restart
        create_task(catcher())

    @abstractmethod
    async def got_message(self, arg: dict[str, Any]):
        """
        新的消息进入
        注意这个函数不能是一个死循环
        别忘了使用 `self.catch_joined`
        """
        pass

    async def stop(self):
        """终止服务"""
        self._unmount()


class BaseCallee(BaseService, ABC):
    """如果不想要多次接受消息的服务，而是只接受一次消息的异步函数"""
    @abstractmethod
    async def main(self, arg: dict[str, Any]):
        """主函数"""

    @override
    async def got_message(self, arg: dict[str, Any]):
        try:
            await self.main(arg)
        except:
            self.error(traceback.format_exc())
        finally:
            await self.stop()


class TaskManager:
    """管理分散的任务"""

    def __init__(self) -> None:
        self._tasks_running: set[Task[None]] = set()
        """所有正在执行的任务"""

    def add_task(self, coroutine: Coroutine[Any, Any, Any]):
        """添加一个任务"""
        task = create_task(coroutine)
        self._tasks_running.add(task)
        task.add_done_callback(lambda task: self._tasks_running.remove(task))

    async def wait_tasks(self):
        """等待所有任务完成"""
        return await gather(*self._tasks_running, return_exceptions=True)
