import MicrophoneStream from "microphone-stream";
import { useEffect, useRef, useState, useMemo } from "react";
import { Duplex, DuplexOptions } from "readable-stream";
import { createModel, KaldiRecognizer } from "vosk-browser";
import { RecognizerMessage, ServerMessageResult } from "vosk-browser/dist/interfaces";

export const VoskLanguages = {
    jp: "jp",
    en: "en"
} as const
export type VoskLanguages = typeof VoskLanguages[keyof typeof VoskLanguages]

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
    isTranscribeStated: boolean
    results: string[]
    language: VoskLanguages
}
export type VoskStateAndMethod = VoskState & {
    setIsTranscribeStated: (val: boolean) => void
    clearResults: () => void
    setLanguage: (val: VoskLanguages) => void
}

export const useVosk = (): VoskStateAndMethod => {
    const [language, setLanguage] = useState<VoskLanguages>("jp")
    const [recognizer, setRecognizer] = useState<KaldiRecognizer>();
    const resultRef = useRef<string[]>([]);
    const [results, setResults] = useState<string[]>(resultRef.current);
    // const [_partialResult, setPartialResult] = useState<string>("");
    const [isTranscribeStated, setIsTranscribeStated] = useState<boolean>(false)

    useEffect(() => {
        const loadVosk = async () => {
            console.log("LOAD_VOSK1")
            const model = await createModel(`./vosk/${language}/model.tar.gz`);
            const recognizer = new model.KaldiRecognizer(48000);
            recognizer.on("result", (message: RecognizerMessage) => {
                console.log(`Result: ${message}`, message);
                const res = message as ServerMessageResult;
                if (res.result && res.result.text) {
                    resultRef.current = [...resultRef.current, res.result.text];
                    setResults(resultRef.current);
                }
            });
            recognizer.on("partialresult", (_message: any) => {
                // console.log(`PartialResult: ${message}`, message);
                // setPartialResult(message.result.partial);
            });
            setRecognizer(recognizer);
        };
        loadVosk();
    }, [language]);

    const micStream = useMemo(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const ifrm = document.getElementById('inner-index')!.contentWindow as Window;
        const dstNodeForInternal = ifrm.getDstNodeForInternal();

        if (!recognizer || !dstNodeForInternal) {
            return null;
        }

        const audioStreamer = new AudioStreamer(recognizer, {
            objectMode: true,
        });
        const micStream = new MicrophoneStream({
            objectMode: true,
            bufferSize: 1024,
        });
        micStream.setStream(dstNodeForInternal.stream);

        micStream.pipe(audioStreamer);
        micStream.pause();
        return micStream
    }, [isTranscribeStated])


    ///// (X) Start Transcribe
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const ifrm = document.getElementById('inner-index')!.contentWindow as Window;
        const dstNodeForInternal = ifrm.getDstNodeForInternal();
        const audioContext = ifrm.getAudioContext();
        const referableAudios = ifrm.getReferableAudios()

        console.log("TRANSCIBE START?", isTranscribeStated);
        if (!micStream) {
            return
        }
        if (!dstNodeForInternal) {
            return
        }
        const startT = async () => {
            for (const x of referableAudios) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const ms = x.captureStream() as MediaStream;
                // TODO: disconnect old mediastream ?
                if (audioContext && ms.getAudioTracks().length > 0) {
                    const src = audioContext.createMediaStreamSource(ms);
                    src.connect(dstNodeForInternal);
                }
            }
            micStream.resume();
        };

        if (isTranscribeStated) {
            console.log("TRANSCRIBE START")
            startT();
        } else {
            console.log("TRANSCRIBE STOP")
            micStream?.pause()
        }
    }, [isTranscribeStated, micStream]);

    const clearResults = () => {
        resultRef.current = [];
        setResults(resultRef.current);
    }
    // ///// (X) Start Transcribe
    // const recorderRef = useRef<MediaRecorder | null>(null)
    // const chunksRef = useRef<Blob[]>([])
    // useEffect(() => {
    //     console.log("TRANSCIBE START?", startTranscribe);
    //     // if (!micStream) {
    //     //     return
    //     // }
    //     if (!props.dstNodeForInternal) {
    //         return
    //     }
    //     const startT = async () => {
    //         for (const x of props.referableAudios) {
    //             // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //             // @ts-ignore
    //             const ms = x.captureStream() as MediaStream;
    //             // TODO: disconnect old mediastream ?
    //             if (props.audioContext && ms.getAudioTracks().length > 0) {
    //                 const src = props.audioContext.createMediaStreamSource(ms);
    //                 src.connect(props.dstNodeForInternal!);
    //             }
    //         }
    //         // console.log("TRANSCIBE START?", micStream);
    //         // micStream.resume();


    //         console.log("RECORD1", props.dstNodeForInternal)
    //         console.log("RECORD2", props.dstNodeForInternal!.stream)
    //         console.log("RECORD3", props.dstNodeForInternal!.stream.getAudioTracks())
    //         recorderRef.current = new MediaRecorder(props.dstNodeForInternal!.stream);

    //         recorderRef.current.ondataavailable = (e) => {
    //             console.log("Data Added", e);
    //             chunksRef.current.push(e.data);
    //         };
    //         recorderRef.current.onstop = () => {
    //             console.log("data available after MediaRecorder.stop() called.");
    //             const blob = new Blob(chunksRef.current, {
    //                 type: "audio/opus",
    //             });
    //             const url = URL.createObjectURL(blob);
    //             const a = document.createElement("a");
    //             document.body.appendChild(a);
    //             // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //             // @ts-ignore
    //             a.style = "display: none";
    //             a.href = url;
    //             a.download = "test.mp3";
    //             a.click();
    //             window.URL.revokeObjectURL(url);
    //             chunksRef.current = [];

    //             const formData = new FormData();
    //             formData.append("audio", blob, "audio.xxx")
    //             fetch('/api/transcribe',
    //                 {
    //                     method: 'post',
    //                     body: formData
    //                 });

    //         };
    //         recorderRef.current.start(1000 * 3);
    //     };

    //     if (startTranscribe) {
    //         console.log("TRANSCRIBE START")
    //         startT();
    //     } else {
    //         console.log("TRANSCRIBE STOP")
    //         recorderRef.current?.stop()
    //     }
    // }, [startTranscribe, props.audioContext, props.dstNodeForInternal, props.referableAudios]);

    const retVal: VoskStateAndMethod = {
        language,
        results,
        isTranscribeStated,
        setLanguage,
        setIsTranscribeStated,
        clearResults
    }
    return retVal
}