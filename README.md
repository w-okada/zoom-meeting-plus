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
1. [Zoom Meeting SDKでアバターにいろいろしゃべらせる。](https://qiita.com/wok/items/205c086f19a7ff73718d)
1. [Zoom Meeting SDKをつかって会議にアバターで参加する](https://qiita.com/wok/items/1bccd567e844ac4e8979)
1. [Zoom Meeting SDKでなんちゃってボイスチェンジャー](https://qiita.com/wok/items/08c9505d5c3c95d8956d)
1. [Zoom Meetingにアバターで参加するぞ。番外編](https://qiita.com/wok/items/4f51e1a72d735b75f73f)
1. [Zoom Meeting SDKとVosk browserでZoom会議のリアルタイム文字起こし](https://qiita.com/wok/items/e83c49c530354a7b8b42)

# Demo
## Docker
```
$ docker run -p 8888:8888 dannadori/zoom-meeting-plus:v06
$ docker run --rm -it -p '127.0.0.1:50021:50021' voicevox/voicevox_engine:cpu-ubuntu20.04-latest
$ docker run -it -p 5500:5500 synesthesiam/opentts:en
```
## Heroku
https://zoom-meeting-plus.herokuapp.com/


---------


# Develop Memo
From here, memo for developper. 

# Backend
## Deploy to heroku
```
$ heroku login
$ heroku create zoom-meeting-plus
$ git remote -v
$ heroku apps:info -s | grep web_url | cut -d= -f2
https://zoom-meeting-plus.herokuapp.com/

$ npm run deploy:backend
```
access https://zoom-meeting-plus.herokuapp.com/api/generateSignature to check deploy.

一度containerでデプロイするとモードが切り替わり、通常デプロイができなくなる。
デプロイ方法を再設定する必要がある。（意味不明な仕様だな。。。）
https://devcenter.heroku.com/articles/container-registry-and-runtime#changing-deployment-method
https://devcenter.heroku.com/articles/stack#migrating-to-a-new-stack


## Env Var
### Set environmental variables to heroku.
ZOOM_SDK_KEY="xxx"
ZOOM_SDK_SECRET="xxx"
KEY_GENERATE_SECRET=""
VOICE_VOX_URL="https://zoom-meeting-plus-voicevox.herokuapp.com"
OPEN_TTS_URL="https://zoom-meeting-plus-opentts.herokuapp.com"

### Local Signer
If we can use local sign server, set same variables to `.env/.env`.

docker run -p 8888:8888 -v  `pwd`/.env:/app/.env  -ti wok/sshtest

## Deploy VoiceVox, OpenTTS to heroku
see each repository.

# Acknowledgments
## VRM
[燐酸様](https://hub.vroid.com/users/42394227)配布の眼鏡さんを使用しています。
https://hub.vroid.com/characters/3590580643081577083/models/4344551722337138718

## 音声
https://ondoku3.com/ja/
https://github.com/VOICEVOX/voicevox_engine

## 


## Docker起動
### Demo
```
$ docker run -p 8888:8888 -v  `pwd`/.env:/app/.env  -ti wok/sshtest
```
### Build Docker(wsl2)
```
$ eval `ssh-agent`
$ ssh-add ~/.ssh/xxxx
$ npm run build:docker
```
### push to docker hub
```
$ docker tag zoom-meeting-plus dannadori/zoom-meeting-plus:v01
$ docker login 
Username: dannadori
Password: xx
$ docker push dannadori/zoom-meeting-plus:v01
```

### docker run with docker hub
```
$ docker run -p 8888:8888 dannadori/zoom-meeting-plus
```

### VoiceBox
```
$ docker run --rm -it -p '127.0.0.1:50021:50021' voicevox/voicevox_engine:cpu-ubuntu20.04-latest
```


