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

