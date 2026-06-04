"""
lib.manager.io
输入输出函数
"""

from abc import ABC, abstractmethod
from asyncio import (
    Future,
    Queue,
    Task,
    create_task,
    gather,
    get_running_loop,
    run_coroutine_threadsafe,
)
from contextlib import contextmanager
import json
import os
from sys import stdin
import traceback
from typing import Any, Optional, Tuple, override

from .base import MainErrorable


class StdinCopyer(MainErrorable):
    """复制输入流来可暂停地读取"""

    def __init__(self) -> None:
        super().__init__()
        self._dup_fd: Optional[int]
        """输入流复制的文件描述符"""
        self._main_out_queue = Queue()
        """全局输出队列"""

    @contextmanager
    def _enter_stdin(self):
        """得到输入流的复制"""
        self._dup_fd = os.dup(stdin.fileno())
        with os.fdopen(self._dup_fd, 'r', closefd=True) as f:
            yield f
        self._exit_stdin()

    def _exit_stdin(self):
        """停止读取输入流"""
        if self._dup_fd is None:
            return
        try:
            os.close(self._dup_fd)
        except OSError:
            pass
        self._dup_fd = None


class IoManager(StdinCopyer, ABC):
    """掌管输入和输出"""

    def __init__(self) -> None:
        super().__init__()
        self._input_queue: Queue[str] = Queue()
        """输入的字符串队列"""
        self._loop = get_running_loop()
        """当前的事件循环"""
        self._io_tasks: Optional[Tuple[Future[None], Task[None], Task[None]]]
        """任务列表"""

    def start(self):
        """开启输入输出循环"""
        if not self._io_tasks:
            self._io_tasks = (
                self._loop.run_in_executor(None, self._read),
                create_task(self.print()),
                create_task(self._parse()),
            )

    async def stop(self):
        """停止输入输出循环"""
        if not self._io_tasks:
            return
        self._exit_stdin()
        for task in self._io_tasks[1:]:
            task.cancel()
        await gather(*self._io_tasks, return_exceptions=True)
        await self.stop()

    def _read(self):
        """阻塞读取输入"""
        try:
            with self._enter_stdin() as f:
                while True:
                    try:
                        line = f.readline()
                    except:
                        line = ''
                    finally:
                        line = line.strip()
                    if not line:
                        run_coroutine_threadsafe(
                            self.stop(),
                            self._loop,
                        )
                        break
                    run_coroutine_threadsafe(
                        self._input_queue.put(str(line)),
                        self._loop,
                    )
        except Exception:
            self.inter_error('main', traceback.format_exc())

    @abstractmethod
    def get_arg(self, arg: dict[str, Any], /):
        """得到一个传来的参数"""

    async def _parse(self):
        """解析每行输入"""
        try:
            while True:
                line = await self._input_queue.get()
                try:
                    arg = json.loads(line)
                    if not isinstance(arg, dict):
                        raise Exception()
                except Exception:
                    self.main_error(
                        'badInput',
                        line=line,
                        info=traceback.format_exc(),
                    )
                    continue
                self.get_arg(arg)
        except Exception:
            self.inter_error('main', traceback.format_exc())

    @property
    @override
    def _out_queue(self):
        return self._main_out_queue

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
                        info['service'],
                        info=traceback.format_exc(),
                    )
                    continue
                print(line, flush=True)
        except Exception:
            self.inter_error('main', traceback.format_exc())
