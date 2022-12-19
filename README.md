Zoom Meeting Plus
-------
Zoom Meeting Plusは、お好みのキャラクターでZoomミーティングを簡単に行えるアプリケーションです。

現在は、ずんだもんがサポートされています。

![zumudamon](https://user-images.githubusercontent.com/48346627/208299239-1c299f26-e22e-45e8-8d77-24bca96b1a30.png)


上の絵、こちらの絵はAIに書いてもらったZoomを使うずんだもん（＝ずむだもん）です。

# デモ

https://user-images.githubusercontent.com/48346627/208338019-b73bdc03-5319-423e-b891-314a05097e45.mp4



# 使用方法

## 前提
- Docker

## 前作業
[こちらの記事](https://qiita.com/yosuke-sawamura/items/de69e73e47335cd61d68)を参考にZoomのSDK KeyとSDK Secretを取得してください。

## 音声サーバの起動
本アプリは二つの音声サーバをサポートします。

- VC Trainer & Player for MMVC
- Voicevox


### VC Trainer & Player for MMVCの起動方法

[MMVC公式ページ](https://github.com/isletennos/MMVC_Trainer)

[VC Trainer & Player 公式ページ](https://github.com/w-okada/voice-changer)

VC Trainer & PlayerはAIを用いたリアルタイムボイスチェンジャーMMVCのヘルパーアプリケーションです。次のコマンドでサーバとして起動させることができます。ポート番号は18888の部分を変えることで変更できます。(２か所は連動して同じ値にすること)
```
$ git clone --depth 1  https://github.com/w-okada/voice-changer.git -b z001_qiita_advent_calendar_2022_zoom
$ cd voice-changer
$ bash start2.sh MMVC
```

### Voicevox起動方法

[公式ページ](https://github.com/VOICEVOX/voicevox_engine)

公式の標準の起動方法ではgithub pagesからのアクセスができません。`--cors_policy_mode all`をつけて起動するようにします。どのサーバのウェブページであってもローカルのVoicevoxにアクセスするような処理を記述するとアクセスできるようになります。これは悪意のあるサーバのページでも同じです。不要な時にはコンテナをシャットダウンするなど、対策を行うことをお勧めします。

```
$ docker run --rm --gpus all --entrypoint="" -p 50021:50021 voicevox/voicevox_engine:nvidia-ubuntu20.04-latest gosu user /opt/python/bin/python3 ./run.py --use_gpu --voicelib_dir /opt/voicevox_core/ --runtime_dir /opt/onnxruntime/lib --host 0.0.0.0 --cors_policy_mode all
```

## アプリケーションの起動と操作方法

次のページにアクセスしてください。

[Zoom Meeting Plus](https://w-okada.github.io/zoom-meeting-plus/)

下の画面が出てきたらClick to startを押してください。

![image](https://user-images.githubusercontent.com/48346627/208299383-4cd84c8e-74be-4459-84ea-1f6044e5cac7.png)


下の画面に遷移したら「会議室でのユーザ名」「ミーティング番号」「ミーティングのパスワード」「SDK Key(前述したもの)」「SDK Secret(前述したもの)」を入力してEnterを押してください。

![image](https://user-images.githubusercontent.com/48346627/208299820-f92bf2bf-df07-473f-92af-b469af708277.png)



下の画面が出たらjoinボタンを押してください。Zoom会議に参加できます。

![image](https://user-images.githubusercontent.com/48346627/208299866-5959a910-be52-4180-bd3d-db57d768a866.png)


画面右側のパネルでは各種操作が可能になっています。

下の部分では、Zoomミーティングに送信される画面が表示されています。画像下のボタンでアバターの動作を変えることができます。また、音声を発しているときには自動的にtalkin状態になります。

![image](https://user-images.githubusercontent.com/48346627/208299933-7ef76e13-0d0e-4321-9fce-6afc4d2c69ed.png)


下の図ではVC Trainer And Player for MMVCの各種制御が行えます。

![image](https://user-images.githubusercontent.com/48346627/208300257-84eeca50-d4b9-4c39-ba41-07eb86315dd2.png)


下の部分ではVoicevoxの各種制御が行えます。またGoogle Speechによる音声認識＋Voicevoxでの音声発話も可能です。

![image](https://user-images.githubusercontent.com/48346627/208300432-275029c1-52c6-4ff2-98df-f73d406e0655.png)


# 謝辞
- [MMVC様](https://github.com/isletennos/MMVC_Trainer)
- [Voicevox様](https://github.com/VOICEVOX/voicevox_engine)
- [akihiyo様](https://seiga.nicovideo.jp/user/illust/20132633)


古い記事
-------
# Zoom Meeting Plus
You can join the zoom meeting with avatar as you like.

# Documentation
Documentation is published as blog. Please see them.
## English
1. [Time keeper bot with Zoom Meeting SDK](https://dannadori.medium.com/time-keeper-bot-with-zoom-meeting-sdk-11f2feb3dc14)
1. [Talking avatar with Zoom Meeting SDK](https://dannadori.medium.com/talking-avatar-with-zoom-meeting-sdk-c67444aa9ea1)
1. [Motion tracking avatar with Zoom Meeting SDK](https://dannadori.medium.com/motion-tracking-avatar-with-zoom-meeting-sdk-3f7b6de4f33b)
1. [Voice changer with Zoom Meeting SDK](https://dannadori.medium.com/voice-changer-with-zoom-meeting-sdk-11708305ffd3)
1. [Use avatar you like in Zoom !](https://medium.com/@dannadori/use-avatar-you-like-in-zoom-e660c43cd2a2)

## Japanese
1. [Zoom Meeting SDKでタイムキーパーちゃんを作る。](https://qiita.com/wok/items/205c086f19a7ff73718d)
1. [Zoom Meeting SDKでアバターにいろいろしゃべらせる。](https://qiita.com/wok/items/0450c8620f11a371bd8b)
1. [Zoom Meeting SDKをつかって会議にアバターで参加する](https://qiita.com/wok/items/1bccd567e844ac4e8979)
1. [Zoom Meeting SDKでなんちゃってボイスチェンジャー](https://qiita.com/wok/items/08c9505d5c3c95d8956d)
1. [Zoom Meetingにアバターで参加するぞ。番外編](https://qiita.com/wok/items/4f51e1a72d735b75f73f)
1. [Zoom Meeting SDKとVosk browserでZoom会議のリアルタイム文字起こし](https://qiita.com/wok/items/e83c49c530354a7b8b42)

# Demo
## Docker
```
$ docker run -p 8888:8888 dannadori/zoom-meeting-plus:v08
$ docker run --rm -it -p '127.0.0.1:50021:50021' voicevox/voicevox_engine:cpu-ubuntu20.04-latest
$ docker run --rm -it -p 5500:5500 synesthesiam/opentts:en
```
access to http://localhost:8888/
## Heroku
https://zoom-meeting-plus.herokuapp.com/


---------

