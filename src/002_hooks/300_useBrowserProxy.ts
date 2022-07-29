import { useEffect, useMemo, useRef, useState } from "react";
import { ThreeStateAndMethods } from "./110_useThree";

export type UseBrowserProxyProps = {
    threeState: ThreeStateAndMethods;
}

export type BrowserProxyState = {
    referableAudios: HTMLAudioElement[] //ReferableAudio[]
    audioContext: AudioContext | null
    dstNodeForInternal: MediaStreamAudioDestinationNode | null
    voiceDiffRef: React.MutableRefObject<number>

    audioInputDeviceId: string | null
    audioInputEnabled: boolean
}
export type BrowserProxyStateAndMethod = BrowserProxyState & {
    initBrowserProxy: () => void

    playAudio: (audioData: ArrayBuffer, callback?: ((diff: number) => void) | undefined) => Promise<void>
    getUserMedia: (constraints?: MediaStreamConstraints | undefined) => Promise<MediaStream>
    enumerateDevices: () => Promise<MediaDeviceInfo[]>

    setAudioInputDeviceId: (deviceId: string | null) => void
    setAudioInputEnabled: (val: boolean) => void

}
export const useBrowserProxy = (props: UseBrowserProxyProps): BrowserProxyStateAndMethod => {

    // TODO 動くか確認。
    const [referableAudios, setReferableAudios] = useState<ReferableAudio[]>([])
    const referableAudioAdded = (audio: ReferableAudio) => {
        referableAudios.push(audio);
        setReferableAudios([...referableAudios])
    };
    class ReferableAudio extends Audio {
        constructor(src?: string | undefined) {
            super(src);
            console.log("REFEREABLE AUDIO")
            referableAudioAdded(this);
            this.crossOrigin = "anonymous"
        }
    }

    const [audioInputDeviceId, setAudioInputDeviceId] = useState<string | null>(null)
    const [audioInputEnabled, setAudioInputEnabled] = useState<boolean>(false)

    useEffect(() => {
        global.Audio = ReferableAudio;
    }, []);

    // (x) new get user media
    const getUserMedia = useMemo(() => {
        return navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    }, []);
    const enumerateDevices = useMemo(() => {
        return navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices)
    }, [])
    navigator.mediaDevices.enumerateDevices = useMemo(() => {
        return async () => {
            const devices = await enumerateDevices()
            // return devices
            const newDevices = devices.filter(x => { return x.kind === "audiooutput" })
            newDevices.push({
                deviceId: "default_audioinput",
                groupId: "defaul_audioinput",
                kind: "audioinput",
                label: "avatar voice",
                toJSON: () => { console.warn("not implemented.") }
            })
            newDevices.push({
                deviceId: "default_videoinput",
                groupId: "defaul_videoinput",
                kind: "videoinput",
                label: "avatar movie",
                toJSON: () => { console.warn("not implemented.") }
            })
            console.log("devices original:", devices)
            console.log("devices new:", newDevices)
            return newDevices
        }
    }, [])


    // Audio Context
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
    const initBrowserProxy = useMemo(() => {
        return () => {
            if (!audioContext) {
                setAudioContext(new AudioContext())
            }
        }
    }, [audioContext])

    // Dummy Audio Input
    const dummyMediaStream = useMemo(() => {
        if (!audioContext) {
            return null
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
    }, [audioContext])

    // source node
    // dummy, audio, zoom-incomming, avatarの4つ
    //// (1) dummy はimmutableで作成
    const srcNodeDummyInput = useMemo(() => {
        if (!dummyMediaStream || !audioContext) {
            return null
        }
        return audioContext.createMediaStreamSource(dummyMediaStream);
    }, [dummyMediaStream])

    //// (2) audioは可変
    const srcNodeAudioInputRef = useRef<MediaStreamAudioSourceNode | null>(null)
    //// (3) zoom-incomingは可変
    const srcNodeZoomIncommintRef = useRef<MediaStreamAudioSourceNode | null>(null)
    //// (4) avatarはオンデマンド。管理しない。

    // destination node
    // zoom-outgoing, internal, analyzer
    //// (1) zoom-out はデバイス選択時にTrackが閉じられるので可変
    const dstNodeForZoomRef = useRef<MediaStreamAudioDestinationNode | null>(null)
    //// (2) internalは不変。
    const dstNodeForInternal = useMemo(() => {
        if (!audioContext) {
            return null
        }
        return audioContext.createMediaStreamDestination();
    }, [audioContext])
    //// (3) Analizer Nodeは不変。
    const analyzerNode = useMemo(() => {
        if (!audioContext) {
            return null
        }
        return audioContext.createAnalyser()
    }, [audioContext])


    const intervalTimerAvatar = useRef<NodeJS.Timer | null>(null)
    const intervalTimerAudioInput = useRef<NodeJS.Timer | null>(null)


    // function convertI420AFrameToI420Frame(frame: any) {
    //     const { width, height } = frame.codedRect;
    //     // Y, U, V, Alpha values are stored sequentially. Take only YUV values
    //     const buffer = new Uint8Array(width * height * 3);
    //     frame.copyTo(buffer, { rect: frame.codedRect });
    //     const init = {
    //         timestamp: 0,
    //         codedWidth: width,
    //         codedHeight: height,
    //         format: "I420"
    //     };
    //     console.log("convert")
    //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //     // @ts-ignore
    //     return new VideoFrame(buffer, init);
    // }

    // function transform(stream: MediaStream) {
    //     const videoTrack = stream.getVideoTracks()[0];
    //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //     // @ts-ignore
    //     const trackProcessor = new MediaStreamTrackProcessor({
    //         track: videoTrack
    //     });
    //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //     // @ts-ignore
    //     const trackGenerator = new MediaStreamTrackGenerator({ kind: "video" });

    //     const transformer = new TransformStream({
    //         async transform(videoFrame, controller) {
    //             const newFrame = convertI420AFrameToI420Frame(videoFrame);
    //             videoFrame.close();
    //             controller.enqueue(newFrame);
    //         }
    //     });

    //     trackProcessor.readable
    //         .pipeThrough(transformer)
    //         .pipeTo(trackGenerator.writable);

    //     const processedStream = new MediaStream();
    //     processedStream.addTrack(trackGenerator);
    //     return processedStream;
    // }

    // getUserMedia の上書き
    // getUserMedia を呼ばれるときには、Zoomに渡していたMediaStreamと、
    // 取得元のDestNodeは壊されるようなので、DestNodeを再生成する必要がある。
    // 関連して周囲のNode Chainも再構成
    useEffect(() => {
        navigator.mediaDevices.getUserMedia = async (params) => {
            // console.log("GETUSERMEDIA", params)
            const msForZoom = new MediaStream();
            if (params?.audio) {
                if (!audioContext) {
                    console.warn("audio context is not initialized", audioContext)
                    return msForZoom // no trakcs
                }
                if (!srcNodeDummyInput) {
                    console.warn("dummy audio device is not initialized", srcNodeDummyInput)
                    return msForZoom // no trakcs
                }

                // zoom-outgoingから切断
                // TODO: disconnect freeze?
                if (dstNodeForZoomRef.current) {
                    // srcNodeDummyInput.disconnect(dstNodeForZoomRef.current)
                    srcNodeAudioInputRef.current?.disconnect(dstNodeForZoomRef.current)
                }

                // zoom-outgoing再生成
                dstNodeForZoomRef.current = audioContext.createMediaStreamDestination();
                // zoom-outgoingへ再接続
                srcNodeDummyInput.connect(dstNodeForZoomRef.current)
                srcNodeAudioInputRef.current?.connect(dstNodeForZoomRef.current)

                // AudioのMediaTrackを追加
                dstNodeForZoomRef.current.stream.getAudioTracks().forEach((x) => {
                    msForZoom.addTrack(x);
                });
            }

            if (params?.video) {
                // const testCanvas = document.getElementById("test") as HTMLCanvasElement;
                //// Zoom用のストリーム作成
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const avatarMediaStream = props.threeState.renderer.domElement.captureStream() as MediaStream;
                // const avatarMediaStream = testCanvas.captureStream() as MediaStream;
                avatarMediaStream.getVideoTracks().forEach((x) => {
                    msForZoom.addTrack(x);
                });


            }
            // return transform(msForZoom);
            return msForZoom;
        };
    }, [props.threeState.renderer, audioContext, srcNodeDummyInput]);

    // Audio Inputが更新されたとき
    useEffect(() => {
        const reconstructAudioInputNode = async () => {
            if (!audioContext || !dstNodeForZoomRef.current || !dstNodeForInternal || !analyzerNode) {
                console.warn("audio node is not initialized")
                return
            }
            // 切断処理
            try {
                if (intervalTimerAudioInput.current) {
                    clearInterval(intervalTimerAudioInput.current)
                    intervalTimerAudioInput.current = null
                }
                srcNodeAudioInputRef.current?.disconnect(dstNodeForZoomRef.current)
                srcNodeAudioInputRef.current?.disconnect(dstNodeForInternal)
                srcNodeAudioInputRef.current?.disconnect(analyzerNode)
            } catch (e) {
                console.warn("disconnect failed. ignore this.", e)
            }

            // srcNodeAudioInputRef.current = null

            //再生成
            if (audioInputDeviceId && audioInputEnabled) {
                const ms = await getUserMedia({ audio: { deviceId: audioInputDeviceId } })
                srcNodeAudioInputRef.current = audioContext.createMediaStreamSource(ms)
                srcNodeAudioInputRef.current.connect(dstNodeForZoomRef.current)
                srcNodeAudioInputRef.current.connect(dstNodeForInternal)
                srcNodeAudioInputRef.current.connect(analyzerNode)



                if (intervalTimerAudioInput.current) {
                    clearInterval(intervalTimerAudioInput.current)
                    intervalTimerAudioInput.current = null
                }
                const times = new Uint8Array(analyzerNode.fftSize);
                intervalTimerAudioInput.current = setInterval(() => {
                    analyzerNode.getByteTimeDomainData(times);
                    const max = Math.max(...times);
                    const min = Math.min(...times);
                    voiceDiffRef.current = max - min
                    // console.log("ANALYZER:", max, min, max - min);
                }, 50);
            }
        }
        reconstructAudioInputNode()
    }, [audioInputDeviceId, audioInputEnabled])

    // Referable Audio が更新されたとき
    useEffect(() => {
        if (!audioContext || !dstNodeForInternal) {
            return
        }
        // 切断処理
        srcNodeZoomIncommintRef.current?.disconnect(dstNodeForInternal)
        // 再生成
        const zoomIncomingMS = new MediaStream()
        referableAudios.forEach(x => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const ms = x.captureStream() as MediaStream
            ms.getAudioTracks().forEach(track => {
                zoomIncomingMS.addTrack(track)
            })
        })
        if (zoomIncomingMS.getAudioTracks().length > 0) {
            srcNodeZoomIncommintRef.current = audioContext.createMediaStreamSource(zoomIncomingMS)
            console.log("Generate Zoom Incoming.")

        } else {
            console.warn("zoom incoming audio is not initialized. ignore this.")
        }

    }, [referableAudios])


    // Avatar の発話    
    const voiceDiffRef = useRef<number>(0)
    const playAudio = async (audioData: ArrayBuffer) => {
        // decode処理
        if (!audioContext || !dstNodeForZoomRef.current || !dstNodeForInternal || !analyzerNode) {
            console.warn("audio context is not initialized (playAudio) ", audioContext, analyzerNode, dstNodeForZoomRef.current)
            return;
        }

        if (intervalTimerAvatar.current) {
            clearInterval(intervalTimerAvatar.current)
            intervalTimerAvatar.current = null
        }
        const times = new Uint8Array(analyzerNode.fftSize);
        intervalTimerAvatar.current = setInterval(() => {
            analyzerNode.getByteTimeDomainData(times);
            const max = Math.max(...times);
            const min = Math.min(...times);
            voiceDiffRef.current = max - min
            // console.log("ANALYZER:", max, min, max - min);
        }, 50);

        // Source Node生成
        const srcBufferNode = audioContext.createBufferSource();
        const audioBuffer = await audioContext.decodeAudioData(audioData);
        srcBufferNode.buffer = audioBuffer;
        srcBufferNode.onended = () => {
            console.log("Buffer_end");
            if (intervalTimerAvatar.current) {
                clearInterval(intervalTimerAvatar.current)
                intervalTimerAvatar.current = null
            }
        };
        // 接続処理
        srcBufferNode.connect(dstNodeForZoomRef.current);
        srcBufferNode.connect(dstNodeForInternal);
        srcBufferNode.connect(analyzerNode);
        srcBufferNode.start();
    };


    const retVal: BrowserProxyStateAndMethod = {
        referableAudios,
        audioContext,
        dstNodeForInternal,
        audioInputDeviceId,
        audioInputEnabled,

        initBrowserProxy,
        playAudio,
        getUserMedia,
        enumerateDevices,
        setAudioInputDeviceId,
        setAudioInputEnabled,

        voiceDiffRef,
    }
    return retVal
}