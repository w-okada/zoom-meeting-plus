/* eslint-disable @typescript-eslint/no-var-requires */
require("dotenv").config({ path: "./.env/.env" });
const express = require("express");
const request = require("request");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const bodyParser = require("body-parser");
const cors = require("cors");
const KJUR = require("jsrsasign");
const path = require("path");
const fs = require("fs");
const app = express();
const port = process.env.PORT || 8888;
app.use(bodyParser.json(), cors());

// 意味不明だ。。。requireの時のみ記載されたファイルからの相対パスになるらしい。https://yinm.info/20201104/
const setting = require("../dist/assets/setting.json");
// const setting = fs.readFileSync(`./dist/assets/setting.json`, "utf8");
console.log(setting);

if (process.env.VOICE_VOX_URL) {
    setting.voice_setting.voice_vox_url = process.env.VOICE_VOX_URL;
}
if (process.env.OPEN_TTS_URL) {
    setting.voice_setting.open_tts_url = process.env.OPEN_TTS_URL;
}

if (process.env.OAUTH_CLIENT_ID) {
    setting.oauth.client_id = process.env.OAUTH_CLIENT_ID;
}
if (process.env.OAUTH_REDIRECT_URL) {
    setting.oauth.redirect_url = process.env.OAUTH_REDIRECT_URL;
}
// if (process.env.OAUTH_GET_ZAK_URL) {
//     setting.oauth.get_zak_url = process.env.OAUTH_GET_ZAK_URL;
// }

// app.use("/", express.static("dist"));
app.use(
    "/",
    express.static("dist", {
        setHeaders: function (res, path) {
            res.set("Cross-Origin-Opener-Policy", "same-origin");
            res.set("Cross-Origin-Embedder-Policy", "require-corp");
        },
    })
);

app.options("*", cors());
// 設定取得
app.get("/api/setting", (req, res) => {
    res.json(setting);
});

// OAUTHリダイレクト先URL. Stateに呼び出し元のURLを設定しておく。再リダイレクトしてクライアントにzakを通知する。
app.get("/api/redirect", (req, res) => {
    // res.json(setting);
    const code = req.query.code;
    const appURL = req.query.state;

    const url = `https://zoom.us/oauth/token?grant_type=authorization_code&code=${code}&redirect_uri=${setting.oauth.redirect_url}`;
    console.log("GET_TOKEN_URL:", url);
    console.log("GET_TOKEN AUTH PARAM (ClientID):", setting.oauth.client_id);
    if (!process.env.OAUTH_CLIENT_SECRET) {
        console.warn("GET_TOKEN AUTH PARAM (ClientSecret): NOT INITIALIZED!. Maybe config is not valid.");
    } else {
        console.log("GET_TOKEN AUTH PARAM (ClientSecret): exists(hidden)");
    }
    request
        .post(url, (error, response, body) => {
            // Parse response to JSON
            console.log("ERROR:", JSON.stringify(error));
            console.log("RESPONSE:", JSON.stringify(response));

            body = JSON.parse(body);
            const accessToken = body.access_token;
            const refreshToken = body.refresh_token;
            console.log(`access_token: ${accessToken}`);
            console.log(`refresh_token: ${refreshToken}`);

            request
                .get(`https://api.zoom.us/v2/users/me/token?type=zak`, (error, response, body) => {
                    if (error) {
                        console.log("API Response Error: ", error);
                    } else {
                        body = JSON.parse(body);
                        // console.log("RESPONSE:", JSON.stringify(response));
                        // console.log("ERROR:", JSON.stringify(error));
                        const zak = body.token;
                        console.log(`zak: ${zak}`);
                        const redirectURL = `${appURL}?accessToken=${accessToken}&zak=${zak}`;
                        res.redirect(redirectURL);
                    }
                })
                .auth(null, null, true, body.access_token);
        })
        .auth(setting.oauth.client_id, process.env.OAUTH_CLIENT_SECRET);
});

// テスト用
app.get("/api/generateSignature", (req, res) => {
    res.json({
        signature: "TEST",
    });
});

// Signature生成
app.post("/api/generateSignature", (req, res) => {
    const iat = Math.round(new Date().getTime() / 1000) - 30;
    const exp = iat + 60 * 60 * 2;
    const secret = req.body.secret;

    if (process.env.KEY_GENERATE_SECRET && process.env.KEY_GENERATE_SECRET.length > 0) {
        if (secret != process.env.KEY_GENERATE_SECRET) {
            res.json({
                signature: "wrong secret",
                sdkKey: "wrong secret",
            });
        }
    }

    const oHeader = { alg: "HS256", typ: "JWT" };
    console.log("SDK KEY:", process.env.ZOOM_SDK_KEY, req.body, req.body.meetingNumber, req.body.role);
    const oPayload = {
        sdkKey: process.env.ZOOM_SDK_KEY,
        mn: req.body.meetingNumber,
        role: req.body.role,
        iat: iat,
        exp: exp,
        appKey: process.env.ZOOM_SDK_KEY,
        tokenExp: iat + 60 * 60 * 2,
    };

    const sHeader = JSON.stringify(oHeader);
    const sPayload = JSON.stringify(oPayload);
    const signature = KJUR.jws.JWS.sign("HS256", sHeader, sPayload, process.env.ZOOM_SDK_SECRET);

    res.json({
        signature: signature,
        sdkKey: process.env.ZOOM_SDK_KEY,
    });
});

app.post("/api/transcribe", upload.single("audio"), function (req, res, next) {
    console.log(req.body);
    console.log(req.file);
});
app.listen(port, () => console.log(`Zoom Meeting SDK for Web. running on port: ${port}!`));
