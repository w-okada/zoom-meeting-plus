import { ZoomMeetingPlusInitEvent, ZoomMeetingPlusJoinEvent } from "./sharedTypes";

console.log("test.js");
const enumerateDevices = navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices);

navigator.mediaDevices.enumerateDevices = async () => {
    const devices = await enumerateDevices();
    // return devices
    // const newDevices = devices.filter(x => { return x.kind === "audiooutput" })
    const newDevices = devices.filter((_x) => {
        return true;
    });
    newDevices.push({
        deviceId: "default_audioinput",
        groupId: "defaul_audioinput",
        kind: "audioinput",
        label: "avatar voice",
        toJSON: () => {
            console.warn("not implemented.");
        },
    });
    newDevices.push({
        deviceId: "default_videoinput",
        groupId: "defaul_videoinput",
        kind: "videoinput",
        label: "avatar movie",
        toJSON: () => {
            console.warn("not implemented.");
        },
    });
    console.log("CAMERA_DEVICES", devices);
    console.log("CAMERA_NEW_DEVICES", newDevices);
    return newDevices;
};

const initZoomClient = async () => {
    window.ZoomMtg.preLoadWasm();
    window.ZoomMtg.prepareWebSDK();
    window.ZoomMtg.i18n.load("en-US");
    window.ZoomMtg.i18n.reload("en-US");

    console.log("ZOOM_MTG_INIT_0");
    const p = new Promise<void>((resolve, reject) => {
        window.ZoomMtg.init({
            leaveUrl: "./",
            success: (success: any) => {
                console.log("ZOOM_MTG_INIT_1");
                console.log(success);
                resolve();
            },
            error: (error: any) => {
                console.log("ZOOM_MTG_INIT_2");
                console.warn(error);
                reject(error);
            },
        });
    });
    await p;
};

const joinZoom = async (username: string, meetingNumber: string, password: string, signature: string, sdkKey: string) => {
    const p = new Promise<void>((resolve, reject) => {
        window.ZoomMtg.join({
            signature: signature,
            meetingNumber: meetingNumber,
            userName: username,
            sdkKey: sdkKey,
            passWord: password,
            success: (success: any) => {
                console.log("ZOOM_MTG_INIT3");
                console.log(success);
                resolve();
            },
            error: (error: any) => {
                console.log("ZOOM_MTG_INIT4");
                console.warn(error);
                reject(error);
            },
        });
    });
    await p;
};

window.addEventListener("message", function (event: MessageEvent<any>) {
    console.log("EVENT_MESSAGE", event);
    const data = event.data;
    initZoomClient();
    // joinZoom(
    //     "ab",
    //     "7176502271",
    //     "358414",
    //     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZGtLZXkiOiJLZmFPd0dHVTl3ZUdWaHl3eHdWTnNISTF6STZvNEkxeHRaRVgiLCJtbiI6IjcxNzY1MDIyNzEiLCJyb2xlIjoiMCIsImlhdCI6MTY1OTM2Mzg1NCwiZXhwIjoxNjU5MzcxMDU0LCJhcHBLZXkiOiJLZmFPd0dHVTl3ZUdWaHl3eHdWTnNISTF6STZvNEkxeHRaRVgiLCJ0b2tlbkV4cCI6MTY1OTM3MTA1NH0.1HRBel2PZZTfOd_STYzGC-pr-vOzxmZQnVb8kzgeh74",
    //     "KfaOwGGU9weGVhywxwVNsHI1zI6o4I1xtZEX"
    // );
    if (data.type === "ZoomMeetingPlusInitEvent") {
        const zoomData = data as ZoomMeetingPlusInitEvent;
        console.log("event:", zoomData.type);
        initZoomClient();
    } else if (data.type === "ZoomMeetingPlusJoinEvent") {
        const zoomData = data as ZoomMeetingPlusJoinEvent;
        console.log("event:", zoomData.type);
        const div = parent.document.getElementById("sidebar-avatar-area");
        console.log("DIV_ELEMENT", div);
        joinZoom(zoomData.data.username, zoomData.data.meetingNumber, zoomData.data.password, zoomData.data.signature, zoomData.data.sdkKey);
    }
});

console.log("inner-html-loaded");
