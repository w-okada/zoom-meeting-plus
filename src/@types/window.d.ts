import { ZoomMtg } from "@zoomus/websdk";

declare global {
    interface Window {
        ZoomMtg: ZoomMtg
        isZoomInitialized: () => void
        isZoomJoined: () => void
        setVoiceCallback: (callback: (val: number) => void) => void
        playAudio: (audioData: ArrayBuffer) => Promise<void>
        reconstructAudioInputNode: (audioInputDeviceId: string | null, audioInputEnabled: boolean) => Promise<void>

        getDstNodeForInternal: () => MediaStreamAudioDestinationNode | null
        getAudioContext: () => AudioContext | null
        getReferableAudios: () => ReferableAudio[]

    }
}