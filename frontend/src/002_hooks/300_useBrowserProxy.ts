import { useEffect, useState } from "react";
import { useAppSetting } from "../003_provider/001_AppSettingProvider";

export type BrowserProxyState = {
    voiceValue: number
    mmvcState: string
    mmvcResponseTime: number
    mmvcSendBufferingTime: number
}
export type BrowserProxyStateAndMethod = BrowserProxyState & {
    playAudio: (audioData: ArrayBuffer, callback?: ((diff: number) => void) | undefined) => Promise<void>
    startVoiceChanger: () => Promise<void>
    stopVoiceChanger: () => Promise<void>
}
export const useBrowserProxy = (): BrowserProxyStateAndMethod => {
    const { applicationSettingState, deviceManagerState } = useAppSetting()
    const [voiceValue, setVoiceValue] = useState<number>(0)
    const [mmvcState, setMmvcState] = useState<string>("")
    const [mmvcResponseTime, setMmvcResponseTime] = useState<number>(0)
    const [mmvcSendBufferingTime, setMmvcSendBufferingTime] = useState<number>(0)
    // const [audioInputDeviceId, setAudioInputDeviceId] = useState<string | null>(null)
    // const [audioInputEnabled, setAudioInputEnabled] = useState<boolean>(false)

    useEffect(() => {
        const setMonitors = () => {
            // @ts-ignore
            const ifrm = document.getElementById('inner-index')!.contentWindow as Window;
            if (typeof ifrm.setStateCallback !== "function") {
                setTimeout(setMonitors, 1000)
                return
            }
            ifrm.setStateCallback((msg: string) => {
                setMmvcState(msg)
            })
            ifrm.setResponseTimeCallback((val: number) => {
                setMmvcResponseTime(val)
            })
            ifrm.setSendBufferingTimeCallback((val: number) => {
                setMmvcSendBufferingTime(val)
            })
        }
        setMonitors()
    }, [])


    // Audio Inputが更新されたとき
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const ifrm = document.getElementById('inner-index')!.contentWindow as Window;
        if (typeof ifrm.reconstructAudioInputNode !== "function") {
            return
        }
        ifrm.reconstructAudioInputNode(deviceManagerState.audioInputDeviceId, true);
    }, [deviceManagerState.audioInputDeviceId])

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
        if (typeof ifrm.playAudio !== "function") {
            return
        }
        ifrm.playAudio(audioData);
    }

    // MMVC Start
    const startVoiceChanger = async () => {
        // @ts-ignore
        const ifrm = document.getElementById('inner-index')!.contentWindow as Window;
        if (typeof ifrm.startVoiceChanger !== "function") {
            return
        }
        ifrm.startVoiceChanger()
    }
    const stopVoiceChanger = async () => {
        // @ts-ignore
        const ifrm = document.getElementById('inner-index')!.contentWindow as Window;
        if (typeof ifrm.stopVoiceChanger !== "function") {
            return
        }
        ifrm.stopVoiceChanger()
    }

    useEffect(() => {
        // @ts-ignore
        const ifrm = document.getElementById('inner-index')!.contentWindow as Window;
        if (typeof ifrm.changeVoiceChangerSetting !== "function") {
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
        voiceValue,
        mmvcState,
        mmvcResponseTime,
        mmvcSendBufferingTime,
        playAudio,

        startVoiceChanger,
        stopVoiceChanger

    }
    return retVal
}