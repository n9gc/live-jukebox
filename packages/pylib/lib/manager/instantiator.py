"""
lib.manager.instantiaor
服务管理
"""

from asyncio import gather
from importlib import import_module
from inspect import isabstract
import traceback
from typing import cast, override

from lib.base import BaseService

from .base import MainErrorable


class ServiceInstantiator(MainErrorable):
    """查找并拉起服务"""

    def __init__(self) -> None:
        super().__init__()
        self._injected_cls_cache: dict[str, type[BaseService]] = dict()
        """已经被注入方法的服务"""
        self._services: dict[str, BaseService] = dict()
        """当前存活的服务"""

    _service_cls_cache: dict[str, type[BaseService]] = dict()
    """缓存获取到的服务"""

    def get_service_cls(self, service_name: str):
        """获取服务类"""
        cached = self._service_cls_cache.get(service_name)
        if cached is not None:
            return cached

        service_module = None
        try:
            service_module = import_module(service_name, '')
        except Exception:
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
        self._service_cls_cache[service_name] = service_cls
        return service_cls

    def get_injected_cls(self, service_name: str):
        """获得已经注入好的服务类"""

        cached = self._injected_cls_cache.get(service_name)
        if cached is not None:
            return cast(type['injected_cls'], cached)

        service_cls = self.get_service_cls(service_name)
        if not service_cls:
            return False

        class injected_cls(service_cls):
            @property
            @override
            def _name(_) -> str:
                return service_name

            @property
            @override
            def _out_queue(_):
                return self._out_queue

            @override
            def _unmount(service_ins):
                poped = self._services.pop(service_name, service_ins)
                if poped != service_ins:
                    self._services[service_name] = poped

            @override
            def _error(_, info: str):
                self.inter_error(service_name, info)

        if isabstract(injected_cls):
            return self.main_error(
                'notImplemented',
                service_name,
                methodsLost=list(injected_cls.__abstractmethods__),
            )

        self._injected_cls_cache[service_name] = injected_cls
        return injected_cls

    def get_service_ins(self, service_name: str):
        """获取运行中的服务"""
        running = self._services.get(service_name)
        if running is not None:
            return running

        injected_cls = self.get_injected_cls(service_name)
        if not injected_cls:
            return False

        try:
            service_ins = injected_cls()
        except Exception:
            return self.main_error(
                'badInstance',
                service_name,
                info=traceback.format_exc(),
            )
        self._services[service_name] = service_ins
        return cast(BaseService, service_ins)

    async def stop_all(self):
        """停止所有服务"""
        await gather(
            *(
                service.stop()
                for service in self._services.values()
            ),
            return_exceptions=True,
        )
