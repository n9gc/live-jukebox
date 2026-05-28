"""
lib.base
基类的定义
"""

from abc import ABC, abstractmethod
from asyncio import Lock, Task, create_task, gather
import json
import traceback
from typing import Any, Callable, Coroutine, override

type AVoid = Coroutine[Any, Any, None]
"""空返回的异步函数的调用后结果"""


class BaseService(ABC):
    """服务基类"""

    def __init__(
            self,
            name: str,
            out_lock: Lock,
            unmount: Callable[[], AVoid],
            error: Callable[[str], AVoid]
    ) -> None:
        self.name = name
        """模块被调用时的名称"""
        self._out_lock = out_lock
        """输出锁"""
        self._unmount = unmount
        """取消注册服务"""
        self.error = error
        """报错函数"""
        self._error_no = 0
        """长期运行函数的错误数量"""
        self.max_error_no = 200
        """长期运行函数的最大错误数量，防止循环错误"""

    async def _dumps(self, n: Any):
        """序列化为 json 字符串"""
        try:
            return json.dumps(n)
        except:
            await self.out(
                service='main',
                event='jsonOutFailed',
                name=self.name,
                info=traceback.format_exc(),
            )

    async def out(self, **info):
        """输出信息"""
        if 'service' not in info:
            info['service'] = self.name
        json_str = await self._dumps(info)
        if json_str is None:
            return
        async with self._out_lock:
            print(json_str, flush=True)

    def catch_joined(self, joined: AVoid, restart: AVoid):
        """捕获长期运行函数里的错误"""
        async def catcher():
            try:
                await joined
            except:
                self._error_no += 1
                await self.error(traceback.format_exc())
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
        await self._unmount()


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
            await self.error(traceback.format_exc())
        finally:
            await self.stop()


class TaskManager:
    """管理分散的任务"""

    def __init__(self) -> None:
        self._tasks_running: set[Task[None]] = set()
        """所有正在执行的任务"""

    def add_task(self, coroutine: AVoid):
        """添加一个任务"""
        task = create_task(coroutine)
        self._tasks_running.add(task)
        task.add_done_callback(lambda task: self._tasks_running.remove(task))

    async def wait_tasks(self):
        """等待所有任务完成"""
        return await gather(*self._tasks_running, return_exceptions=True)
