"""
lib.bili.listen
监听 b 站直播弹幕服务
"""

from asyncio import Lock, gather
import http.cookies
from itertools import chain
from typing import Any, Callable, Tuple, override

from aiohttp import ClientSession

import blivedm
import blivedm.models.web as web_models
from lib.base import AVoid, BaseService, TaskManager


def init_session(sess_data: str) -> ClientSession:
    """获得 Session 对象"""
    cookies = http.cookies.SimpleCookie()
    cookies['SESSDATA'] = sess_data
    cookies['SESSDATA']['domain'] = 'bilibili.com'

    session = ClientSession()
    session.cookie_jar.update_cookies(cookies)
    return session


class MyHandler(blivedm.BaseHandler):
    """弹幕消息回调"""

    def __init__(self, log: Callable[[dict[str, Any]], None]) -> None:
        super().__init__()
        self._log = log

    @override
    def _on_danmaku(self, client: blivedm.BLiveClient, msg: web_models.DanmakuMessage):
        info = {
            'timestamp': msg.timestamp,
            'dmType': msg.dm_type,
            'message': msg.msg,
            'uid': msg.uid,
            'uname': msg.uname,
            'face': msg.face,
            'admin': bool(msg.admin),
            'vip': bool(msg.vip),
            'svip': bool(msg.svip),
            'userLevel': msg.user_level,
        }
        self._log(info)

    @override
    def _on_super_chat(self, client: blivedm.BLiveClient, msg: web_models.SuperChatMessage):
        pass


class Main(BaseService, TaskManager):
    """服务本身"""

    def __init__(self, name: str, out_lock: Lock, unmount: Callable[[], AVoid], error: Callable[[str], AVoid]) -> None:
        super().__init__(name, out_lock, unmount, error)
        self._runnings: dict[
            int,
            Tuple[str, ClientSession, blivedm.BLiveClient],
        ] = dict()
        """正在运行的弹幕监听器"""

    @override
    async def got_message(self, arg):
        operation = str(arg['operation'])
        match operation:
            case 'open' | 'restart':
                room_id = int(arg['roomId'])
                sess_data = str(arg['sessData'])

                cached = self._runnings.get(room_id)
                if (
                    operation != 'restart'
                    and cached is not None
                    and sess_data == ''
                    and cached[0] != ''
                ):
                    return

                session = init_session(sess_data)
                client = blivedm.BLiveClient(room_id, session=session)
                handler = MyHandler(
                    lambda info: self.add_task(self.out(**info)),
                )
                client.set_handler(handler)
                client.start()
                self._runnings[room_id] = (sess_data, session, client)
                self.catch_joined(client.join(), self.got_message(arg))
            case 'close':
                room_id = int(arg['roomId'])
                running = self._runnings.pop(room_id)
                if running is None:
                    return
                await gather(
                    running[1].close(),
                    running[2].stop_and_close(),
                )

    @override
    async def stop(self):
        await super().stop()
        await gather(*chain(*(
            [session.close(), client.stop_and_close()]
            for _, session, client in self._runnings.values()
        )))
        await self.wait_tasks()
