import { ZoomMeetingPlusInitEvent, ZoomMeetingPlusJoinEvent } from "./sharedTypes";

console.log("test.js");
let zoomInitCompleted = false;
let zoomJoinCompleted = false;

const referableAudios: ReferableAudio[] = [];
class ReferableAudio extends Audio {
    constructor(src?: string | undefined) {
        super(src);
        console.log("REFEREABLE AUDIO");
        referableAudios.push(this);
        this.crossOrigin = "anonymous";
        updateZoomIncomingNode();
    }
}
global.Audio = ReferableAudio;

// 固定ノード(固定だが、audioContextがuser-gestureが必要なので、初期値はnull)
let audioContext: AudioContext | null = null;
let dummyMediaStream: MediaStream | null = null;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
let srcNodeDummyInput: MediaStreamAudioSourceNode | null = null;
let dstNodeForInternal: MediaStreamAudioDestinationNode | null = null;
let analyzerNode: AnalyserNode | null;

// 可変ノード
let srcNodeAudioInput: MediaStreamAudioSourceNode | null = null;
let srcNodeZoomIncomming: MediaStreamAudioSourceNode | null = null;
let dstNodeForZoom: MediaStreamAudioDestinationNode | null = null;

const initializeAudio = () => {
    audioContext = new AudioContext();
    dummyMediaStream = createDummyMediaStream();
    srcNodeDummyInput = createSrcNodeDummyInput();

    dstNodeForInternal = createDstNodeForInternal();
    analyzerNode = createAnalyzerNode();
};

const createDummyMediaStream = () => {
    if (!audioContext) {
        return null;
    }
    const dummyOutputNode = audioContext.createMediaStreamDestination();

    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.0;
    gainNode.connect(dummyOutputNode);
    const oscillatorNode = audioContext.createOscillator();
    oscillatorNode.frequency.value = 440;
    oscillatorNode.connect(gainNode);
    oscillatorNode.start();
    return dummyOutputNode.stream;
};

const createSrcNodeDummyInput = () => {
    if (!dummyMediaStream || !audioContext) {
        return null;
    }
    return audioContext.createMediaStreamSource(dummyMediaStream);
};

const createDstNodeForInternal = () => {
    if (!audioContext) {
        return null;
    }
    return audioContext.createMediaStreamDestination();
};

const createAnalyzerNode = () => {
    if (!audioContext) {
        return null;
    }
    return audioContext.createAnalyser();
};

let intervalTimerAvatar: NodeJS.Timer | null = null;
let intervalTimerAudioInput: NodeJS.Timer | null = null;

const enumerateDevices = navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices);

navigator.mediaDevices.enumerateDevices = async () => {
    const devices = await enumerateDevices();
    // return devices
    const newDevices = devices.filter((x) => {
        return x.kind === "audiooutput";
    });
    // const newDevices = devices.filter((_x) => {
    //     return true;
    // });
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

const getUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);

navigator.mediaDevices.getUserMedia = async (params) => {
    // console.log("GETUSERMEDIA", params)
    const msForZoom = new MediaStream();
    if (params?.audio) {
        // const ms = await getUserMedia(params);
        // ms.getAudioTracks().forEach((x) => {
        //     msForZoom.addTrack(x);
        // });
        if (!audioContext) {
            console.warn("audio context is not initialized", audioContext);
            return msForZoom; // no trakcs
        }
        if (!srcNodeDummyInput) {
            console.warn("dummy audio device is not initialized", srcNodeDummyInput);
            return msForZoom; // no trakcs
        }

        // zoom-outgoingから切断
        // TODO: disconnect freeze?
        if (dstNodeForZoom && srcNodeAudioInput) {
            console.log("CAMERA_DEVICES1");
            srcNodeAudioInput.disconnect(dstNodeForZoom);
            console.log("CAMERA_DEVICES2");
        }
        if (dstNodeForZoom && srcNodeDummyInput) {
            console.log("CAMERA_DEVICES3");
            srcNodeDummyInput.disconnect(dstNodeForZoom);
            console.log("CAMERA_DEVICES4");
        }

        // zoom-outgoing再生成
        dstNodeForZoom = audioContext.createMediaStreamDestination();
        // zoom-outgoingへ再接続
        srcNodeDummyInput.connect(dstNodeForZoom);
        srcNodeAudioInput?.connect(dstNodeForZoom);

        // AudioのMediaTrackを追加
        dstNodeForZoom.stream.getAudioTracks().forEach((x) => {
            msForZoom.addTrack(x);
        });
    }

    if (params?.video) {
        //// Zoom用のストリーム作成
        const div = parent.document.getElementById("sidebar-avatar-area") as HTMLDivElement;
        const canvas = div.firstChild as HTMLCanvasElement;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const avatarMediaStream = canvas.captureStream() as MediaStream;
        avatarMediaStream.getVideoTracks().forEach((x) => {
            msForZoom.addTrack(x);
        });
    }
    // return transform(msForZoom);
    return msForZoom;
};

// Audio Inputが更新されたとき
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const reconstructAudioInputNode = async (audioInputDeviceId: string | null, audioInputEnabled: boolean) => {
    if (!audioContext || !dstNodeForZoom || !dstNodeForInternal || !analyzerNode) {
        console.warn("audio node is not initialized");
        return;
    }
    // 切断処理
    try {
        if (intervalTimerAudioInput) {
            clearInterval(intervalTimerAudioInput);
            intervalTimerAudioInput = null;
        }
        if (srcNodeAudioInput) {
            srcNodeAudioInput.disconnect(dstNodeForZoom);
            srcNodeAudioInput.disconnect(dstNodeForInternal);
            srcNodeAudioInput.disconnect(analyzerNode);
        }
    } catch (e) {
        console.warn("disconnect failed. ignore this.", e);
    }

    //再生成
    if (audioInputDeviceId && audioInputEnabled) {
        const ms = await getUserMedia({ audio: { deviceId: audioInputDeviceId } });
        srcNodeAudioInput = audioContext.createMediaStreamSource(ms);
        srcNodeAudioInput.connect(dstNodeForZoom);
        srcNodeAudioInput.connect(dstNodeForInternal);
        srcNodeAudioInput.connect(analyzerNode);

        if (intervalTimerAudioInput) {
            clearInterval(intervalTimerAudioInput);
            intervalTimerAudioInput = null;
        }
        const times = new Uint8Array(analyzerNode.fftSize);
        intervalTimerAudioInput = setInterval(() => {
            analyzerNode!.getByteTimeDomainData(times);
            const max = Math.max(...times);
            const min = Math.min(...times);
            // voiceDiffRef = max - min
            // console.log("ANALYZER(TBD:callback):", max, min, max - min);
            voiceCallback(max - min);
        }, 50);
    }
};
// Referable Audio が更新されたとき
const updateZoomIncomingNode = () => {
    if (!audioContext || !dstNodeForInternal) {
        return;
    }
    // 切断処理
    srcNodeZoomIncomming?.disconnect(dstNodeForInternal);
    // 再生成
    const zoomIncomingMS = new MediaStream();
    referableAudios.forEach((x) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const ms = x.captureStream() as MediaStream;
        ms.getAudioTracks().forEach((track) => {
            zoomIncomingMS.addTrack(track);
        });
    });
    if (zoomIncomingMS.getAudioTracks().length > 0) {
        srcNodeZoomIncomming = audioContext.createMediaStreamSource(zoomIncomingMS);

        console.log("Generate Zoom Incoming.");
    } else {
        console.warn("zoom incoming audio is not initialized. ignore this.");
    }
};

// Avatar の発話
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const playAudio = async (audioData: ArrayBuffer) => {
    // decode処理
    if (!audioContext || !dstNodeForZoom || !dstNodeForInternal || !analyzerNode) {
        console.warn("audio context is not initialized (playAudio) ", audioContext, analyzerNode, dstNodeForZoom);
        return;
    }

    if (intervalTimerAvatar) {
        clearInterval(intervalTimerAvatar);
        intervalTimerAvatar = null;
    }
    const times = new Uint8Array(analyzerNode.fftSize);
    intervalTimerAvatar = setInterval(() => {
        analyzerNode!.getByteTimeDomainData(times);
        const max = Math.max(...times);
        const min = Math.min(...times);
        // voiceDiffRef.current = max - min;
        // console.log("ANALYZER(TBD:callback):", max, min, max - min);
        voiceCallback(max - min);
    }, 50);

    // Source Node生成
    const srcBufferNode = audioContext.createBufferSource();
    const audioBuffer = await audioContext.decodeAudioData(audioData);
    srcBufferNode.buffer = audioBuffer;
    srcBufferNode.onended = () => {
        console.log("Buffer_end");
        if (intervalTimerAvatar) {
            clearInterval(intervalTimerAvatar);
            intervalTimerAvatar = null;
        }
    };
    // 接続処理
    srcBufferNode.connect(dstNodeForZoom);
    srcBufferNode.connect(dstNodeForInternal);
    srcBufferNode.connect(analyzerNode);
    srcBufferNode.start();
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

export const isZoomInitialized = () => {
    return zoomInitCompleted;
};
export const isZoomJoined = () => {
    return zoomJoinCompleted;
};
let voiceCallback: (val: number) => void = (val: number) => {
    console.warn("voice callback is not set");
};

export const setVoiceCallback = (callback: (val: number) => void) => {
    voiceCallback = callback;
};

window.isZoomInitialized = isZoomInitialized;
window.isZoomJoined = isZoomJoined;
window.playAudio = playAudio;
window.reconstructAudioInputNode = reconstructAudioInputNode;
window.setVoiceCallback = setVoiceCallback;
window.getDstNodeForInternal = () => {
    return dstNodeForInternal;
};
window.getAudioContext = () => {
    return audioContext;
};
window.getReferableAudios = () => {
    return referableAudios;
};

window.addEventListener("message", function (event: MessageEvent<any>) {
    console.log("EVENT_MESSAGE", event);
    const data = event.data;
    const handleEvent = async (data: any) => {
        if (data.type === "ZoomMeetingPlusInitEvent") {
            const zoomData = data as ZoomMeetingPlusInitEvent;
            console.log("event:", zoomData.type);
            initializeAudio();
            await initZoomClient();
            zoomInitCompleted = true;
        } else if (data.type === "ZoomMeetingPlusJoinEvent") {
            const zoomData = data as ZoomMeetingPlusJoinEvent;
            console.log("event:", zoomData.type);
            const div = parent.document.getElementById("sidebar-avatar-area");
            console.log("DIV_ELEMENT", div);
            await joinZoom(zoomData.data.username, zoomData.data.meetingNumber, zoomData.data.password, zoomData.data.signature, zoomData.data.sdkKey);
            zoomJoinCompleted = true;
        }
    };
    handleEvent(data);
});

console.log("inner-html-loaded");
