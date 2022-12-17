import { useMemo, useState } from "react"

export type AudioRootState = {
    audioContext: AudioContext
    isModuleLoaded: boolean
}
export type AudioRootStateAndMethod = AudioRootState & {
    dummy: () => void
}
// //@ts-ignore
// import workerjs from "raw-loader!../../wasm/dist/index.js";

export const useAudioRoot = (): AudioRootStateAndMethod => {
    const [isModuleLoaded, setIsModuleLoaded] = useState<boolean>(false)
    const audioContext = useMemo(() => {
        const ctx = new AudioContext()
        // const scriptUrl = URL.createObjectURL(new Blob([workerjs], { type: "text/javascript" }));
        // ctx.audioWorklet.addModule(scriptUrl).then(() => {
        //     console.log("voice-player-worklet-processor is loaeded.", ctx.audioWorklet)
        setIsModuleLoaded(true)
        // })
        return ctx
    }, [])


    return {
        audioContext,
        isModuleLoaded,
        dummy: () => { }
    }
}
