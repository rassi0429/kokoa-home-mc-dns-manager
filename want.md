# kokoa-home-mc-dns-manager

## 機能
- 自宅のCloudFlareにマインクラフト用のサーバレコードをマネージするWebサービス
- マインクラフト用のレコードなので、SRVレコードを変更、マネージできる機能がほしい
- 登録したサーバは、MOTDを読んでオンラインとかを監視できるprometheusのエンドポイントを用意したい

## フロー
サーバ新規作成ボタンを押す
DNSにしたいレコード 例 `mc-instance1.kokoa.dev` を入力
宛先のIP　例 `192.168.10.92:25567` を入力
そうするとCloudflareにマインクラフト用のSRVレコードがAPI経由で生成される

そしたらインスタンス一覧画面に、MinecraftのMOTDとか、オンライン人数とかが出る。
これがprometheusとかから収取できるようなのも用意する。