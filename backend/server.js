/* eslint-disable @typescript-eslint/no-var-requires */
require("dotenv").config({ path: "./.env/.env" });
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const KJUR = require("jsrsasign");
const path = require("path");

const app = express();
const port = process.env.PORT || 8888;
app.use(bodyParser.json(), cors());
app.use("/", express.static("dist/"));

app.options("*", cors());

app.get("/api/generateSignature", (req, res) => {
    res.json({
        signature: "TEST",
    });
});

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

app.listen(port, () => console.log(`Zoom Meeting SDK for Web. running on port: ${port}!`));
