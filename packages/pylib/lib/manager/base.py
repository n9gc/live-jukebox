"""
lib.manager.base
基础的定义
"""


from typing import Optional, override

from lib.base import Outable


class MainErrorable(Outable):
    """可以输出调度器错误的"""

    @property
    @override
    def _name(self) -> str:
        return 'main'

    def main_error(self, event: str, name: Optional[str] = None, **extra):
        """方便地输出错误"""
        extra['event'] = event
        if name is not None:
            extra['name'] = name
        self.out(**extra)
        return False

    def inter_error(self, service_name: str, info: str):
        """执行内部出现错误"""
        return self.main_error(
            'uncaught',
            service_name,
            info=info,
        )
