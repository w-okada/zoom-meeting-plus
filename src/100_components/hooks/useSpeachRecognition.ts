import { useEffect, useMemo, useRef, useState } from "react";
import { SpeachRecognitionLanguages } from "./SpeachRecognitherLanguages";
export const RecordingState = {
    STOP: "STOP",
    LISTENING: "LISTENING",
    SPEAKING: "SPEAKING",
} as const;

export type RecordingState = typeof RecordingState[keyof typeof RecordingState];

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const SpeechRecognition = webkitSpeechRecognition || SpeechRecognition;



export type SpeachRecognitionState = {
    languageKey: string,
    recordingState: RecordingState
    words: string,
    isProcessing: boolean
}
export type SpeachRecognitionStateAndMethod = SpeachRecognitionState & {
    recognitionStartSync: () => Promise<string>
    setLanguageKey: (val: SpeachRecognitionLanguagesKeys) => void

}

export type SpeachRecognitionLanguagesKeys = keyof typeof SpeachRecognitionLanguages | "default"

export const useSpeachRecognition = () => {
    const [languageKey, setLanguageKey] = useState<SpeachRecognitionLanguagesKeys>("default");
    const [recordingState, setRecordingState] = useState<RecordingState>("STOP")
    const [words, setWords] = useState<string>("");
    const [isProcessing, setIsProcessing] = useState<boolean>(false)
    const resolverRef = useRef<((value: string | PromiseLike<string>) => void) | null>(null)
    const wordsRef = useRef<string>("")

    const recognition = useMemo(() => {
        const recognition = new SpeechRecognition();
        recognition.interimResults = true;

        recognition.onresult = (event: { results: { transcript: string }[][] }) => {
            setRecordingState("SPEAKING")
            console.log("res;", event.results[0][0].transcript, event.results);
            setWords(event.results[0][0].transcript as string);
            wordsRef.current = event.results[0][0].transcript as string

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (event.results[0].isFinal) {
                setIsProcessing(false)
            } else {
                setIsProcessing(true)
            }
        };

        recognition.onstart = (_event: any) => {
            setRecordingState("LISTENING")
        };
        recognition.onaudioend = (event: any) => {
            console.log("onaudioend:", event);
        };
        recognition.onaudiostart = (event: any) => {
            console.log("onaudiostart:", event);
        };
        recognition.onend = (event: any) => {
            console.log("onend:", event);
            if (resolverRef.current) {
                resolverRef.current(wordsRef.current)
                resolverRef.current = null
            }
            wordsRef.current = ""
            setRecordingState("STOP")
            // if (trueEndFlag.current === true) {
            //     trueEndFlag.current = false;
            //     recognition.start();
            // }
        };
        recognition.onerror = (event: any) => {
            console.log("onerror:", event);
            // trueEndFlag.current = true;
        };
        recognition.onnomatch = (event: any) => {
            console.log("onnomatch:", event);
        };
        recognition.onsoundend = (event: any) => {
            console.log("onsoundend:", event);
        };
        recognition.onsoundstart = (event: any) => {
            console.log("onsoundstart:", event);
        };
        recognition.onspeechend = (event: any) => {
            console.log("onspeechend:", event);
            // trueEndFlag.current = true;
        };
        recognition.onspeechstart = (event: any) => {
            console.log("onspeechstart:", event);
        };

        return recognition
    }, [])

    useEffect(() => {
        if (languageKey === "default") {
            console.log(`default language ${navigator.language}`);
            recognition.lang = navigator.language;
        } else {
            recognition.lang = SpeachRecognitionLanguages[languageKey];
        }
    }, [languageKey])

    const recognitionStartSync = async () => {
        const words = await new Promise<string>((resolve) => {
            resolverRef.current = resolve
            recognition.start();
        })
        return words
    }

    return {
        languageKey,
        recordingState,
        words,
        isProcessing,
        recognitionStartSync,
        setLanguageKey
    }
}