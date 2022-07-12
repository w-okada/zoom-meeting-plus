import { useEffect, useMemo, useRef, useState } from "react";
import { ThreeStateAndMethods } from "./110_useThree";

export type UseBrowserProxyProps = {
    isJoined: boolean,
    threeState: ThreeStateAndMethods;
}

export type BrowserProxyState = {
    referableAudios: HTMLAudioElement[] //ReferableAudio[]
    audioContext: AudioContext | null
    dstNodeForInternal: MediaStreamAudioDestinationNode | null
    voiceDiffRef: React.MutableRefObject<number>
}
export type BrowserProxyStateAndMethod = BrowserProxyState & {
    playAudio: (audioData: ArrayBuffer, callback?: ((diff: number) => void) | undefined) => Promise<void>
    getUserMedia: (constraints?: MediaStreamConstraints | undefined) => Promise<MediaStream>
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
            referableAudioAdded(this);
        }
    }

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
            console.log("devices:", devices)
            return newDevices
        }
    }, [])


    const audioContext = useMemo(() => {
        if (!props.isJoined) {
            return null
        }
        return new AudioContext()
    }, [props.isJoined])

    // const dstNodeForZoom = useMemo(() => {
    //     if (!audioContext) {
    //         return null
    //     }
    //     return audioContext.createMediaStreamDestination();
    // }, [audioContext])
    // const dstNodeForInternal = useMemo(() => {
    //     if (!audioContext) {
    //         return null
    //     }
    //     return audioContext.createMediaStreamDestination();
    // }, [audioContext])

    // Device選択ごとに毎回作り直す必要がある。おそらくZoomのなかでtrackがcloseされており、Nodeが持つMが無効化されるから？
    const dstNodeForZoomRef = useRef<MediaStreamAudioDestinationNode | null>(null)
    const dstNodeForInternalRef = useRef<MediaStreamAudioDestinationNode | null>(null)

    const analyzerNode = useMemo(() => {
        if (!audioContext) {
            return null
        }
        return audioContext.createAnalyser()
    }, [audioContext])
    const intervalTimer = useRef<NodeJS.Timer | null>(null)
    const srcNodeRef = useRef<MediaStreamAudioSourceNode | null>(null)

    const dummyAudioDevice = useMemo(() => {
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



    useEffect(() => {
        navigator.mediaDevices.getUserMedia = async (params) => {
            const msForZoom = new MediaStream();
            if (!audioContext) {
                console.warn("audio context is not initialized", audioContext)
                return msForZoom // no trakcs
            }
            if (!dummyAudioDevice) {
                console.warn("dummy audio device is not initialized", dummyAudioDevice)
                return msForZoom // no trakcs
            }

            // console.log("getUserMedia", params)
            // const ms = await new Promise<MediaStream>((resolve) => {
            //     setTimeout(() => {
            //         console.warn("Failed to get MediaStream!?")
            //         resolve(new MediaStream())
            //     }, 1000 * 10)
            //     getUserMedia(params).then(ms => {
            //         resolve(ms)
            //     });
            // })

            // if (params?.audio) {
            //     dummyAudioDevice.getAudioTracks().forEach((x) => {
            //         msForZoom.addTrack(x);
            //     });
            // }

            // Audio
            if (dummyAudioDevice.getAudioTracks().length > 0) {
                // console.log("AUDIO TRACK!!")
                // Manupilate Input Source
                //// Disconnect from Old Source
                if (srcNodeRef.current) {
                    // if (dstNodeForInternal) {
                    //     srcNodeRef.current.disconnect(dstNodeForInternal);
                    // }
                    // if (dstNodeForZoom) {
                    //     srcNodeRef.current.disconnect(dstNodeForZoom);
                    // }
                    if (dstNodeForZoomRef.current) {
                        srcNodeRef.current.disconnect(dstNodeForZoomRef.current);
                    }
                    if (dstNodeForInternalRef.current) {
                        srcNodeRef.current.disconnect(dstNodeForInternalRef.current);
                    }
                }
                //// New Source
                srcNodeRef.current = audioContext.createMediaStreamSource(dummyAudioDevice);
                dstNodeForZoomRef.current = audioContext.createMediaStreamDestination();
                dstNodeForInternalRef.current = audioContext.createMediaStreamDestination();

                //// Connect src to dest
                // srcNodeRef.current.connect(dstNodeForInternal);
                // srcNodeRef.current.connect(dstNodeForZoom);
                srcNodeRef.current.connect(dstNodeForZoomRef.current);
                srcNodeRef.current.connect(dstNodeForInternalRef.current);

                //// Zoom用のノードのストリームをZoomのストリームに。
                // dstNodeForZoom.stream.getAudioTracks().forEach((x) => {
                //     console.log("AudioTRACK", x);
                //     msForZoom.addTrack(x);
                // });
                dstNodeForZoomRef.current.stream.getAudioTracks().forEach((x) => {
                    // console.log("AudioTRACK", x);
                    msForZoom.addTrack(x);
                });

            }


            // Video
            //// Avatar Canvas をZoomのストリームに。(内部表示用)
            // const videoInput = document.getElementById("sidebar-avatar-area-video") as HTMLVideoElement;
            // videoInput.srcObject = ms;

            //// Zoom用のストリーム作成
            if (props.threeState.renderer) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const avatarMediaStream = props.threeState.renderer.domElement.captureStream() as MediaStream;
                avatarMediaStream.getVideoTracks().forEach((x) => {
                    msForZoom.addTrack(x);
                });
            }
            console.log(params, msForZoom.getTracks())
            return msForZoom;
        };
    }, [props.threeState.renderer, audioContext, dummyAudioDevice]);


    const voiceDiffRef = useRef<number>(0)
    const playAudio = async (audioData: ArrayBuffer) => {
        // decode処理
        if (!audioContext || !analyzerNode || !dstNodeForZoomRef.current) {
            console.warn("audio context is not initialized (playAudio) ", audioContext, analyzerNode, dstNodeForZoomRef.current)
            return;
        }

        if (intervalTimer.current) {
            clearInterval(intervalTimer.current)
            intervalTimer.current = null
        }
        const times = new Uint8Array(analyzerNode.fftSize);
        intervalTimer.current = setInterval(() => {
            analyzerNode.getByteTimeDomainData(times);
            const max = Math.max(...times);
            const min = Math.min(...times);
            voiceDiffRef.current = max - min
            console.log("ANALYZER:", max, min, max - min);
        }, 50);

        const srcBufferNode = audioContext.createBufferSource();
        const audioBuffer = await audioContext.decodeAudioData(audioData);
        srcBufferNode.buffer = audioBuffer;
        srcBufferNode.onended = () => {
            console.log("Buffer_end");
            if (intervalTimer.current) {
                clearInterval(intervalTimer.current)
                intervalTimer.current = null
            }
        };
        srcBufferNode.connect(analyzerNode);
        srcBufferNode.connect(dstNodeForZoomRef.current);
        srcBufferNode.start();
    };


    const retVal: BrowserProxyStateAndMethod = {
        referableAudios,
        audioContext,
        dstNodeForInternal: dstNodeForInternalRef.current,
        playAudio,
        getUserMedia,

        voiceDiffRef,
    }
    return retVal
}