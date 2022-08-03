import { useEffect, useMemo, useState } from "react"
import { DeviceInfo, DeviceManager } from "../001_clients_and_managers/001_DeviceManager"


type DeviceManagerState = {
    lastUpdateTime: number
    audioInputDevices: DeviceInfo[]
    videoInputDevices: DeviceInfo[]
    audioOutputDevices: DeviceInfo[]

    videoInputDeviceId: string | null
    audioOutputDeviceId: string | null
}
export type DeviceManagerStateAndMethod = DeviceManagerState & {
    reloadDevices: () => Promise<void>
    setVideoElement: (elem: HTMLVideoElement) => Promise<void>
    setVideoInputDeviceId: (val: string | null) => void
    setVideoFileURL: (val: string) => void
    setAudioOutputDeviceId: (val: string | null) => void

}
export const useDeviceManager = (): DeviceManagerStateAndMethod => {
    const [lastUpdateTime, setLastUpdateTime] = useState(0)
    const [videoInputDeviceId, _setVideoInputDeviceId] = useState<string | null>(null)
    const [videoElement, _setVideoElement] = useState<HTMLVideoElement | null>(null)
    const [audioOutputDeviceId, _setAudioOutputDeviceId] = useState<string | null>(null)

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

    // () set video
    const setVideoElement = async (elem: HTMLVideoElement) => {
        if (videoInputDeviceId) {
            const ms = await navigator.mediaDevices.getUserMedia({
                video: {
                    deviceId: videoInputDeviceId
                }
            })
            elem.srcObject = ms
        }
        _setVideoElement(elem)
    }
    const setVideoInputDeviceId = async (val: string | null) => {
        if (val && videoElement) {
            const ms = await navigator.mediaDevices.getUserMedia({
                video: {
                    deviceId: val
                }
            })
            videoElement.srcObject = ms
        } else if (videoElement) {
            videoElement.srcObject = null
        }
        _setVideoInputDeviceId(val)
    }

    const setVideoFileURL = (url: string) => {
        if (videoElement) {
            videoElement.src = url
        }
    }


    const setAudioOutputDeviceId = async (val: string | null) => {
        localStorage.audioOutputDevice = val;
        const echobackAudio = document.getElementById("sidebar-generate-voice-player") as HTMLAudioElement;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        echobackAudio.setSinkId(val)
        _setAudioOutputDeviceId(val)
    }
    useEffect(() => {
        const audioOutputDeviceId = localStorage.audioOutputDevice || null
        const echobackAudio = document.getElementById("sidebar-generate-voice-player") as HTMLAudioElement;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        echobackAudio.setSinkId(audioOutputDeviceId)
        _setAudioOutputDeviceId(audioOutputDeviceId)
    }, [])

    return {
        lastUpdateTime,
        audioInputDevices: deviceManager.realAudioInputDevices,
        videoInputDevices: deviceManager.realVideoInputDevices,
        audioOutputDevices: deviceManager.realAudioOutputDevices,

        videoInputDeviceId,
        audioOutputDeviceId,
        reloadDevices,
        setVideoElement,
        setVideoInputDeviceId,
        setVideoFileURL,
        setAudioOutputDeviceId,
    }
}