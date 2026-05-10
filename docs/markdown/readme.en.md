# Live Jukebox

<!-- auto-readme-i18n-switcher start -->
<!-- auto-readme-i18n-switcher end -->

[![All test](https://github.com/n9gc/live-jukebox/actions/workflows/test-all.yml/badge.svg)](https://github.com/n9gc/live-jukebox/actions/workflows/test-all.yml)

Send a song request comment during a live stream, and the streamer will play a different song for you — that’s what a jukebox is.

## Features

- Read comments from multiple platforms (currently only Bilibili)
- Play music from multiple platforms (currently none)
- Interface and command line available in multiple languages (English, Chinese)
- Works with any streaming tool because it’s a web interface
- Automatically plays songs from a backup playlist when no songs are queued
- Can pause (not implemented)
- Can cancel song requests
- Multiple streamers can share the same playlist by accessing the same server
- Customizable command formats
- Choose from a variety of jukebox skins (currently none)
- User-friendly control panel (not implemented)

## Architecture

![Architecture diagram](https://n9gc.github.io/live-jukebox/markdown/arch.en.svg)

