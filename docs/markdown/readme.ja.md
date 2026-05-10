# ライブ ジュークボックス

<!-- auto-readme-i18n-switcher start -->
<!-- auto-readme-i18n-switcher end  -->

[![All test](https://github.com/n9gc/live-jukebox/actions/workflows/test-all.yml/badge.svg)](https://github.com/n9gc/live-jukebox/actions/workflows/test-all.yml)

ライブ配信にリクエストのコメントを送るだけで、配信者が次々と違う曲を流せるようになります。それがジュークボックスです。

## 特徴

- 複数プラットフォームのコメントを読み取り可能（現在は Bilibili のみ）
- 複数プラットフォームの音楽を再生可能（現在は対応プラットフォームなし）
- UI とコマンドラインの多言語対応（英語、中国語）
- Web インターフェースのため、さまざまなライブ配信ツールと組み合わせて使える
- リクエストがないときは、自動で予備プレイリストの曲を再生
- 一時停止に対応（未実装）
- リクエストのキャンセルが可能
- 同じサーバーにアクセスするだけで、複数の配信者が同一のプレイリストを共有可能
- 異なる形式のコマンドを自由にカスタマイズ可能
- お好みに合わせて選べる複数スキン（現在は一種類もなし）
- ユーザーフレンドリーなコントロールパネル（未実装）

## アーキテクチャ

![アーキテクチャ図](https://n9gc.github.io/live-jukebox/markdown/arch.ja.svg)

