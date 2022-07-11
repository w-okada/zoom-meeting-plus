
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