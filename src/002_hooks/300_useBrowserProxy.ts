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

    const audioContext = useMemo(() => {
        if (!props.isJoined) {
            return null
        }
        return new AudioContext()
    }, [props.isJoined])

    const dstNodeForZoom = useMemo(() => {
        if (!audioContext) {
            return null
        }
        return audioContext.createMediaStreamDestination();
    }, [audioContext])

    const dstNodeForInternal = useMemo(() => {
        if (!audioContext) {
            return null
        }
        return audioContext.createMediaStreamDestination();
    }, [audioContext])

    const analyzerNode = useMemo(() => {
        if (!audioContext) {
            return null
        }
        return audioContext.createAnalyser()
    }, [audioContext])
    const intervalTimer = useRef<NodeJS.Timer | null>(null)
    const srcNodeRef = useRef<MediaStreamAudioSourceNode | null>(null)


    useEffect(() => {
        navigator.mediaDevices.getUserMedia = async (params) => {
            const msForZoom = new MediaStream();
            if (!audioContext || !dstNodeForInternal || !dstNodeForZoom) {
                console.warn("audio context is not initialized", audioContext, dstNodeForInternal, dstNodeForZoom)
                return msForZoom // no trakcs
            }

            console.log("getUserMedia", params)
            const ms = await new Promise<MediaStream>((resolve) => {
                setTimeout(() => {
                    console.warn("Failed to get MediaStream!?")
                    resolve(new MediaStream())
                }, 1000 * 10)
                getUserMedia(params).then(ms => {
                    resolve(ms)
                });
            })

            //// Audio
            if (ms.getAudioTracks().length > 0) {
                // Manupilate Input Source
                //// Disconnect from Old Source
                if (srcNodeRef.current) {
                    if (dstNodeForInternal) {
                        srcNodeRef.current.disconnect(dstNodeForInternal);
                    }
                    if (dstNodeForZoom) {
                        srcNodeRef.current.disconnect(dstNodeForZoom);
                    }
                }
                //// New Source
                srcNodeRef.current = audioContext.createMediaStreamSource(ms);

                //// Connect src to dest
                srcNodeRef.current.connect(dstNodeForInternal);
                srcNodeRef.current.connect(dstNodeForZoom);

                //// Zoom用のノードのストリームをZoomのストリームに。
                dstNodeForZoom.stream.getAudioTracks().forEach((x) => {
                    // console.log("AudioTRACK", x);
                    msForZoom.addTrack(x);
                });
            }

            // Video
            //// Avatar Canvas をZoomのストリームに。(内部表示用)
            const videoInput = document.getElementById("sidebar-avatar-area-video") as HTMLVideoElement;
            videoInput.srcObject = ms;

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
    }, [props.threeState.renderer, audioContext, dstNodeForInternal, dstNodeForZoom]);


    const voiceDiffRef = useRef<number>(0)
    const playAudio = async (audioData: ArrayBuffer) => {
        // decode処理
        if (!audioContext || !dstNodeForZoom || !analyzerNode) {
            console.warn("audio context is not initialized (playAudio) ", audioContext, dstNodeForZoom, analyzerNode)
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
        srcBufferNode.connect(dstNodeForZoom);
        srcBufferNode.start();
    };


    const retVal: BrowserProxyStateAndMethod = {
        referableAudios,
        audioContext,
        dstNodeForInternal,
        playAudio,

        voiceDiffRef,
    }
    return retVal
}