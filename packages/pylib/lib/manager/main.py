"""
lib.manager.main
服务调度器
"""

from asyncio import Task, create_task
import io
import traceback
from typing import Any, override

from lib.base import TaskManager

from .instantiator import ServiceInstantiator
from .io import IoManager


class Manager(IoManager, ServiceInstantiator):
    """任务调度器"""

    def __init__(self) -> None:
        super().__init__()
        self.gotter_tasks = TaskManager()
        """正在接收信息的异步任务"""

    @override
    async def stop(self):
        await super().stop()
        await self.gotter_tasks.wait_tasks()

    @override
    def get_arg(self, arg: dict[str, Any], /):
        if 'service' not in arg:
            self.main_error('serviceNotProvided')
            return
        service_name = str(arg['service'])

        service_ins = self.get_service_ins(service_name)
        if not service_ins:
            return

        def if_raise(task: Task[Any]):
            exception = task.exception()
            if not exception:
                return
            fp = io.StringIO()
            traceback.print_exception(
                type(exception),
                exception,
                exception.__traceback__,
                file=fp,
            )
            self.inter_error(
                service_name,
                fp.getvalue(),
            )

        task = create_task(service_ins.got_message(arg))
        task.add_done_callback(if_raise)
        self.gotter_tasks.add_task(task)


async def main():
    """主函数"""
    return Manager()
