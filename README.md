
# Develop Memo
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

## Env Var
### Set environmental variables to heroku.
ZOOM_SDK_KEY="xxx"
ZOOM_SDK_SECRET="xxx"
KEY_GENERATE_SECRET=""
### Local Signer
If we can use local sign server, set same variables to `.env/.env`.

docker run -p 8888:8888 -v  `pwd`/.env:/app/.env  -ti wok/sshtest


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

### push to docker hub
```
$ docker tag zoom-meeting-plus dannadori/zoom-meeting-plus:v01
$ docker login 
Username: dannadori
Password: xx
```

### docker run with docker hub
```
$ docker run -p 8888:8888 dannadori/zoom-meeting-plus
```

### VoiceBox
```
$ docker run --rm -it -p '127.0.0.1:50021:50021' voicevox/voicevox_engine:cpu-ubuntu20.04-latest
```