import { useEffect, useState } from "react";
import { useAppSetting } from "../003_provider/001_AppSettingProvider";

export type BrowserProxyState = {
    audioInputDeviceId: string | null
    audioInputEnabled: boolean
    voiceValue: number
}
export type BrowserProxyStateAndMethod = BrowserProxyState & {
    playAudio: (audioData: ArrayBuffer, callback?: ((diff: number) => void) | undefined) => Promise<void>
    setAudioInputDeviceId: (deviceId: string | null) => void
    setAudioInputEnabled: (val: boolean) => void

    startVoiceChanger: () => Promise<void>
    stopVoiceChanger: () => Promise<void>
}
export const useBrowserProxy = (): BrowserProxyStateAndMethod => {
    const { applicationSettingState } = useAppSetting()
    const [voiceValue, setVoiceValue] = useState<number>(0)
    const [audioInputDeviceId, setAudioInputDeviceId] = useState<string | null>(null)
    const [audioInputEnabled, setAudioInputEnabled] = useState<boolean>(false)


    // Audio Inputが更新されたとき
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const ifrm = document.getElementById('inner-index')!.contentWindow as Window;
        if (typeof ifrm.reconstructAudioInputNode !== "function") {
            return
        }
        ifrm.reconstructAudioInputNode(audioInputDeviceId, audioInputEnabled);
    }, [audioInputDeviceId, audioInputEnabled])
    useEffect(() => {
        const setVoiceCallback = async () => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const ifrm = document.getElementById('inner-index')!.contentWindow as Window;
            if (typeof ifrm.setVoiceCallback !== "function") {
                setTimeout(setVoiceCallback, 1000 * 1)
            } else {
                ifrm.setVoiceCallback(setVoiceValue)
            }
        }
        setVoiceCallback()
    }, [])


    // Avatar の発話    
    const playAudio = async (audioData: ArrayBuffer) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const ifrm = document.getElementById('inner-index')!.contentWindow as Window;
        ifrm.playAudio(audioData);
    }

    // MMVC Start
    const startVoiceChanger = async () => {
        // @ts-ignore
        const ifrm = document.getElementById('inner-index')!.contentWindow as Window;
        if (typeof ifrm.reconstructAudioInputNode !== "function") {
            return
        }
        ifrm.startVoiceChanger()
    }
    const stopVoiceChanger = async () => {
        // @ts-ignore
        const ifrm = document.getElementById('inner-index')!.contentWindow as Window;
        if (typeof ifrm.reconstructAudioInputNode !== "function") {
            return
        }
        ifrm.stopVoiceChanger()
    }

    useEffect(() => {
        // @ts-ignore
        const ifrm = document.getElementById('inner-index')!.contentWindow as Window;
        if (typeof ifrm.reconstructAudioInputNode !== "function") {
            return
        }
        ifrm.changeVoiceChangerSetting(
            applicationSettingState.applicationSetting.mmvc_setting.src_id,
            applicationSettingState.applicationSetting.mmvc_setting.dst_id,
            applicationSettingState.applicationSetting.mmvc_setting.gpu,
            applicationSettingState.applicationSetting.mmvc_setting.prefix_chunk_size,
            applicationSettingState.applicationSetting.mmvc_setting.chunk_size
        )
    }, [
        applicationSettingState.applicationSetting.mmvc_setting.src_id,
        applicationSettingState.applicationSetting.mmvc_setting.dst_id,
        applicationSettingState.applicationSetting.mmvc_setting.gpu,
        applicationSettingState.applicationSetting.mmvc_setting.prefix_chunk_size,
        applicationSettingState.applicationSetting.mmvc_setting.chunk_size
    ])

    const retVal: BrowserProxyStateAndMethod = {
        audioInputDeviceId,
        audioInputEnabled,
        voiceValue,

        playAudio,
        setAudioInputDeviceId,
        setAudioInputEnabled,

        startVoiceChanger,
        stopVoiceChanger

    }
    return retVal
}