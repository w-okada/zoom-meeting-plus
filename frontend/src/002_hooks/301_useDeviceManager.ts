import { useEffect, useMemo, useState } from "react"
import { DeviceInfo, DeviceManager } from "../001_clients_and_managers/001_DeviceManager"


type DeviceManagerState = {
    lastUpdateTime: number
    audioInputDevices: DeviceInfo[]
    videoInputDevices: DeviceInfo[]
    audioOutputDevices: DeviceInfo[]

    videoInputDeviceId: string | null
    audioInputDeviceId: string | null
    audioOutputDeviceId: string | null
}
export type DeviceManagerStateAndMethod = DeviceManagerState & {
    reloadDevices: () => Promise<void>
    // setVideoElement: (elem: HTMLVideoElement) => Promise<void>
    setVideoInputDeviceId: (val: string | null) => void
    // setVideoFileURL: (val: string) => void
    setAudioInputDeviceId: (val: string | null) => void
    setAudioOutputDeviceId: (val: string | null) => void
    loadedEchobackAudio: () => Promise<void>

}
export const useDeviceManager = (): DeviceManagerStateAndMethod => {
    const [lastUpdateTime, setLastUpdateTime] = useState(0)
    const [audioOutputDeviceId, _setAudioOutputDeviceId] = useState<string | null>(null)
    const [audioInputDeviceId, _setAudioInputDeviceId] = useState<string | null>(null)
    const [videoInputDeviceId, _setVideoInputDeviceId] = useState<string | null>(null)

    const deviceManager = useMemo(() => {
        const manager = new DeviceManager()
        manager.setUpdateListener({
            update: () => {
                setLastUpdateTime(new Date().getTime())
            }
        })
        manager.reloadDevices()
        return manager
    }, [])

    // () Enumerate
    const reloadDevices = useMemo(() => {
        return async () => {
            deviceManager.reloadDevices()
        }
    }, [])


    const setAudioInputDeviceId = async (val: string | null) => {
        localStorage.audioInputDevice = val;
        _setAudioInputDeviceId(val)
    }
    useEffect(() => {
        const audioInputDeviceId = localStorage.audioInputDevice || null
        _setAudioInputDeviceId(audioInputDeviceId)
    }, [])

    const setVideoInputDeviceId = async (val: string | null) => {
        localStorage.videoInputDevice = val;
        _setVideoInputDeviceId(val)
    }
    useEffect(() => {
        const videoInputDeviceId = localStorage.videoInputDevice || null
        _setVideoInputDeviceId(videoInputDeviceId)
    }, [])

    const setAudioOutputDeviceId = async (val: string | null) => {
        localStorage.audioOutputDevice = val;
        const echobackAudio = document.getElementById("sidebar-generate-voice-player") as HTMLAudioElement;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        echobackAudio.setSinkId(val)
        _setAudioOutputDeviceId(val)
    }

    const loadedEchobackAudio = async () => {
        const audioOutputDeviceId = localStorage.audioOutputDevice || null
        const echobackAudio = document.getElementById("sidebar-generate-voice-player") as HTMLAudioElement;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        echobackAudio.setSinkId(audioOutputDeviceId)
        _setAudioOutputDeviceId(audioOutputDeviceId)
    }
    // useEffect(() => {
    //     const audioOutputDeviceId = localStorage.audioOutputDevice || null
    //     const echobackAudio = document.getElementById("sidebar-generate-voice-player") as HTMLAudioElement;

    //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //     // @ts-ignore
    //     echobackAudio.setSinkId(audioOutputDeviceId)
    //     _setAudioOutputDeviceId(audioOutputDeviceId)
    // }, [])

    return {
        lastUpdateTime,
        audioInputDevices: deviceManager.realAudioInputDevices,
        videoInputDevices: deviceManager.realVideoInputDevices,
        audioOutputDevices: deviceManager.realAudioOutputDevices,

        // videoInputDeviceId,
        audioInputDeviceId,
        videoInputDeviceId,
        audioOutputDeviceId,
        reloadDevices,
        setAudioInputDeviceId,
        setVideoInputDeviceId,
        setAudioOutputDeviceId,
        loadedEchobackAudio,
    }
}