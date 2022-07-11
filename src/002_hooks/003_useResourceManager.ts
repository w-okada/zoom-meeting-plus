import { useEffect, useState } from "react"
import { fetchMotion, fetchVoice, generateVoiceWithOpenTTS, generateVoiceWithVoiceVox, getLanguageListFromOpenTTS, getSpeakerListFromOpenTTS, getSpeakerListFromVoiceVox } from "../001_clients_and_managers/009_ResourceLoader"
import { DEFAULT_OPEN_TTS_ENABLED, DEFAULT_VOICE_VOX_ENABLED } from "../const";

export type ResourceManagerState = {
    speakersInOpenTTS: { [lang: string]: string[]; }
    speakersInVoiceVox: { [name: string]: number; }
    voiceVoxEnabled: boolean
    openTTSEnabled: boolean
}

export type ResourceManagerStateAndMethod = ResourceManagerState & {
    fetchMotion: (filename: string) => Promise<any>
    fetchVoice: (filename: string) => Promise<Blob>

    // VOICE GENERATOR
    generateVoiceWithVoiceVox: (speakerId: number, text: string) => Promise<Blob>
    generateVoiceWithOpenTTS: (lang: string, speakerId: string, text: string) => Promise<Blob>
    setVoiceVoxEnabled: (val: boolean) => void
    setOpenTTSEnabled: (val: boolean) => void
    refreshSpeakersInVoiceVox: () => Promise<void>
    refreshLanguageAndSpeakersInOpenTTS: () => Promise<void>
}
export const useResourceManager = (): ResourceManagerStateAndMethod => {
    const [voiceVoxEnabled, setVoiceVoxEnabled] = useState<boolean>(DEFAULT_VOICE_VOX_ENABLED)
    const [openTTSEnabled, setOpenTTSEnabled] = useState<boolean>(DEFAULT_OPEN_TTS_ENABLED)
    const [speakersInOpenTTS, setSpeakers] = useState<{ [lang: string]: string[] }>({})
    const [speakersInVoiceVox, setSpeakersInVoiceVox] = useState<{ [name: string]: number }>({})

    const refreshSpeakersInVoiceVox = async () => {
        const speakers = await getSpeakerListFromVoiceVox()
        const tmpSpekaers: { [name: string]: number } = {}
        speakers.map((x: any) => {
            const name = x.name as string
            x.styles.map((y: any) => {
                const id = y.id as number
                const style = y.name as string
                tmpSpekaers[`${name}_${style}`] = id
            })
        })
        setSpeakersInVoiceVox({ ...tmpSpekaers })
    }
    useEffect(() => {
        refreshSpeakersInVoiceVox()
    }, [])

    const refreshLanguageAndSpeakersInOpenTTS = async () => {
        const languages = await getLanguageListFromOpenTTS() as string[]
        const tmpSpeakers: { [lang: string]: string[] } = {}
        for (const lang of languages) {
            const speakers = await getSpeakerListFromOpenTTS(lang)
            const names = Object.keys(speakers)
            tmpSpeakers[lang] = names
        }
        setSpeakers({ ...tmpSpeakers })
        console.log("SPEAKER4:", tmpSpeakers)

    }
    useEffect(() => {
        console.log("SPEAKER3:")
        refreshLanguageAndSpeakersInOpenTTS()
    }, [])

    return {
        speakersInOpenTTS,
        speakersInVoiceVox,
        voiceVoxEnabled,
        openTTSEnabled,
        setVoiceVoxEnabled,
        setOpenTTSEnabled,
        fetchMotion,
        fetchVoice,
        generateVoiceWithVoiceVox,
        generateVoiceWithOpenTTS,
        refreshSpeakersInVoiceVox,
        refreshLanguageAndSpeakersInOpenTTS
    }
}