import { useEffect, useMemo, useRef, useState } from "react";
import { ThreeStateAndMethods } from "./110_useThree";

export type UseBrowserProxyProps = {
    threeState: ThreeStateAndMethods;
}

export type BrowserProxyState = {
    audioInputDeviceId: string | null
    audioInputEnabled: boolean
    voiceValue: number
}
export type BrowserProxyStateAndMethod = BrowserProxyState & {
    playAudio: (audioData: ArrayBuffer, callback?: ((diff: number) => void) | undefined) => Promise<void>
    setAudioInputDeviceId: (deviceId: string | null) => void
    setAudioInputEnabled: (val: boolean) => void

}
export const useBrowserProxy = (props: UseBrowserProxyProps): BrowserProxyStateAndMethod => {
    const [voiceValue, setVoiceValue] = useState<number>(0)
    const [audioInputDeviceId, setAudioInputDeviceId] = useState<string | null>(null)
    const [audioInputEnabled, setAudioInputEnabled] = useState<boolean>(false)


    // Audio Inputが更新されたとき
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const ifrm = document.getElementById('inner-index')!.contentWindow as Window;
        ifrm.reconstructAudioInputNode(audioInputDeviceId, audioInputEnabled);
    }, [audioInputDeviceId, audioInputEnabled])
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const ifrm = document.getElementById('inner-index')!.contentWindow as Window;
        ifrm.setVoiceCallback(setVoiceValue)
    })


    // Avatar の発話    
    const playAudio = async (audioData: ArrayBuffer) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const ifrm = document.getElementById('inner-index')!.contentWindow as Window;
        ifrm.playAudio(audioData);
    }

    const retVal: BrowserProxyStateAndMethod = {
        audioInputDeviceId,
        audioInputEnabled,
        voiceValue,

        playAudio,
        setAudioInputDeviceId,
        setAudioInputEnabled,

    }
    return retVal
}