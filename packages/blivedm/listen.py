# -*- coding: utf-8 -*-
import asyncio
import http.cookies
import json
import sys

import aiohttp

import lib.blivedm as blivedm
import lib.blivedm.models.web as web_models

# 直播间ID的取值看直播间URL
arg = json.loads(sys.argv[-1])
ROOM_ID = arg['roomId']


# 这里填一个已登录账号的cookie的SESSDATA字段的值
# 不填也可以连接，但是收到弹幕的用户名会打码，UID会变成0
# ==============================================================================
#      如果你是从 `Chrome开发者工具 - 应用` 复制cookie的，不要勾选“显示已解码的网址”
# ==============================================================================
SESSDATA = arg['sessData']


async def main():
    session = init_session()
    try:
        await run_single_client(session)
    finally:
        await session.close()


def init_session() -> aiohttp.ClientSession:
    cookies = http.cookies.SimpleCookie()
    cookies['SESSDATA'] = SESSDATA
    cookies['SESSDATA']['domain'] = 'bilibili.com'

    session = aiohttp.ClientSession()
    session.cookie_jar.update_cookies(cookies)
    return session


async def run_single_client(session: aiohttp.ClientSession):
    client = blivedm.BLiveClient(ROOM_ID, session=session)
    handler = MyHandler()
    client.set_handler(handler)
    client.start()
    try:
        await client.join()
    finally:
        await client.stop_and_close()


def outInfo(name, info): return f'"{name}": {json.dumps(info)}'


class MyHandler(blivedm.BaseHandler):
    def _on_danmaku(self, client: blivedm.BLiveClient, msg: web_models.DanmakuMessage):
        body = ",".join([
            outInfo('timestamp', msg.timestamp),
            outInfo('dmType', msg.dm_type),
            outInfo('message', msg.msg),
            outInfo('uid', msg.uid),
            outInfo('uname', msg.uname),
            outInfo('face', msg.face),
            outInfo('admin', bool(msg.admin)),
            outInfo('vip', bool(msg.vip)),
            outInfo('svip', bool(msg.svip)),
            outInfo('userLevel', msg.user_level),
        ])
        print("{%s}" % body)

    def _on_super_chat(self, client: blivedm.BLiveClient, msg: web_models.SuperChatMessage):
        pass


if __name__ == '__main__':
    asyncio.run(main())
