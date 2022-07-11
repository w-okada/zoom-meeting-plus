import { useEffect, useMemo, useState } from "react"
import { DeviceInfo, DeviceManager } from "../001_clients_and_managers/001_DeviceManager"

type DeviceManagerState = {
    lastUpdateTime: number
    audioInputDevices: DeviceInfo[]
    videoInputDevices: DeviceInfo[]
    audioOutputDevices: DeviceInfo[]

    audioInput: string
    videoInput: string
    currentMediaStream: MediaStream | null
}
export type DeviceManagerStateAndMethod = DeviceManagerState & {
    reload: () => Promise<void>
    setAudioInput: (val: string) => void
    setVideoInput: (val: string) => void
}
export const useDeviceManager = (): DeviceManagerStateAndMethod => {
    const [lastUpdateTime, setLastUpdateTime] = useState(0)
    const [audioInput, setAudioInput] = useState<string>("")
    const [videoInput, setVideoInput] = useState<string>("")
    const [currentMediaStream, _setCurrentMediaStream] = useState<MediaStream | null>(null)

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

    useEffect(() => {
        const generateMediaStream = async () => {
            // const ms = await navigator.mediaDevices.getUserMedia({
            //     audio: {
            //         deviceId: {
            //             exact: audioInput,
            //         },
            //     },
            //     video: {
            //         deviceId: {
            //             exact: videoInput,
            //         },
            //     }
            // });
            // setCurrentMediaStream(ms)
        }
        generateMediaStream()
    }, [audioInput, videoInput])

    return {
        lastUpdateTime,
        audioInputDevices: deviceManager.realAudioInputDevices,
        videoInputDevices: deviceManager.realVideoInputDevices,
        audioOutputDevices: deviceManager.realAudioOutputDevices,
        reload: deviceManager.reloadDevices,

        audioInput,
        setAudioInput,
        videoInput,
        setVideoInput,
        currentMediaStream
    }
}