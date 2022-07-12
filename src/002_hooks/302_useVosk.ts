import MicrophoneStream from "microphone-stream";
import { useEffect, useRef, useState, useMemo } from "react";
import { Duplex, DuplexOptions } from "readable-stream";
import { createModel, KaldiRecognizer } from "vosk-browser";
import { RecognizerMessage, ServerMessageResult } from "vosk-browser/dist/interfaces";
export type UseVoskProps = {
    dstNodeForInternal: MediaStreamAudioDestinationNode | null
    referableAudios: HTMLAudioElement[]
    audioContext: AudioContext | null
}
class AudioStreamer extends Duplex {
    constructor(public recognizer: KaldiRecognizer, options?: DuplexOptions) {
        super(options);
    }

    public _write(chunk: AudioBuffer, _encoding: any, callback: any) {
        const buffer = chunk.getChannelData(0);
        if (this.recognizer && buffer.byteLength > 0) {
            this.recognizer.acceptWaveform(chunk);
        }
        callback();
    }
}

export type VoskState = {
    startTranscribe: boolean
}
export type VoskStateAndMethod = VoskState & {
    setStartTranscribe: (val: boolean) => void
}

export const useVosk = (props: UseVoskProps): VoskStateAndMethod => {
    const [recognizer, setRecognizer] = useState<KaldiRecognizer>();
    const resultRef = useRef<string[]>([]);
    const [_result, setResult] = useState<string[]>(resultRef.current);
    const [_partialResult, setPartialResult] = useState<string>("");
    const [startTranscribe, setStartTranscribe] = useState<boolean>(false)

    useEffect(() => {
        const loadVosk = async () => {
            let model;
            if (document.domain.includes("localhost")) {
                model = await createModel("./vosk/model.tar.gz");
            } else {
                model = await createModel("./frontend/vosk/model.tar.gz");
            }
            const recognizer = new model.KaldiRecognizer(48000);
            recognizer.on("result", (message: RecognizerMessage) => {
                console.log(`Result: ${message}`, message);
                const res = message as ServerMessageResult;
                if (res.result && res.result.text) {
                    resultRef.current = [...resultRef.current, res.result.text];
                    setResult(resultRef.current);
                }
            });
            recognizer.on("partialresult", (message: any) => {
                // console.log(`PartialResult: ${message}`, message);
                setPartialResult(message.result.partial);
            });
            setRecognizer(recognizer);
        };
        loadVosk();
    }, []);

    const micStream = useMemo(() => {
        if (!recognizer || !props.dstNodeForInternal) {
            return null;
        }

        const audioStreamer = new AudioStreamer(recognizer, {
            objectMode: true,
        });
        const micStream = new MicrophoneStream({
            objectMode: true,
            bufferSize: 1024,
        });
        micStream.setStream(props.dstNodeForInternal.stream);

        micStream.pipe(audioStreamer);
        micStream.pause();
        return micStream
    }, [recognizer, props.dstNodeForInternal])


    ///// (X) Start Transcribe
    useEffect(() => {
        console.log("TRANSCIBE START?", startTranscribe);
        if (!micStream) {
            return
        }
        if (!props.dstNodeForInternal) {
            return
        }
        const startT = async () => {
            for (const x of props.referableAudios) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const ms = x.captureStream() as MediaStream;
                // TODO: disconnect old mediastream ?
                if (props.audioContext && ms.getAudioTracks().length > 0) {
                    const src = props.audioContext.createMediaStreamSource(ms);
                    src.connect(props.dstNodeForInternal!);
                }
            }
            console.log("TRANSCIBE START?", micStream);
            micStream.resume();
            // recorderRef.current = new MediaRecorder(dstForRecRef.current!.stream);

            // recorderRef.current.ondataavailable = (e) => {
            //     console.log("Data Added", e);
            //     chunksRef.current.push(e.data);
            // };
            // recorderRef.current.onstop = () => {
            //     console.log("data available after MediaRecorder.stop() called.");
            //     const blob = new Blob(chunksRef.current, {
            //         type: "audio/opus",
            //     });
            //     const url = URL.createObjectURL(blob);
            //     const a = document.createElement("a");
            //     document.body.appendChild(a);
            //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //     // @ts-ignore
            //     a.style = "display: none";
            //     a.href = url;
            //     a.download = "test.mp3";
            //     a.click();
            //     window.URL.revokeObjectURL(url);
            //     chunksRef.current = [];
            // };
            // recorderRef.current.start(1000 * 3);
        };

        if (startTranscribe) {
            startT();
        } else {
            micStream?.stop();
        }
    }, [startTranscribe, micStream, props.audioContext, props.dstNodeForInternal, props.referableAudios]);

    const retVal: VoskStateAndMethod = {
        startTranscribe,
        setStartTranscribe
    }
    return retVal
}