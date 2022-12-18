import { ZoomMtg } from "@zoomus/websdk";

declare global {
    interface Window {
        ZoomMtg: ZoomMtg
        isZoomInitialized: () => void
        isZoomJoined: () => void
        setVoiceCallback: (callback: (val: number) => void) => void
        setStateCallback: (callback: (msg: string) => void) => void
        setResponseTimeCallback: (callback: (val: number) => void) => void
        setSendBufferingTimeCallback: (callback: (val: number) => void) => void
        playAudio: (audioData: ArrayBuffer) => Promise<void>
        reconstructAudioInputNode: (audioInputDeviceId: string | null, audioInputEnabled: boolean) => Promise<void>

        startVoiceChanger: () => void
        stopVoiceChanger: () => void
        setVoiceChangerURL: (url: string) => void
        changeVoiceChangerSetting: (
            src_id: number,
            dst_id: number,
            gpu: number,
            prefix_chunk_size: number,
            chunk_size: number
        ) => void

        getDstNodeForInternal: () => MediaStreamAudioDestinationNode | null
        getAudioContext: () => AudioContext | null
        getReferableAudios: () => ReferableAudio[]

    }
}