import { useEffect, useState } from "react"
import * as ResourceLoader from "../001_clients_and_managers/009_ResourceLoader"
import { useAppSetting } from "../003_provider/001_AppSettingProvider";


export type ResourceManagerState = {
    speakersInOpenTTS: { [lang: string]: string[]; }
    speakersInVoiceVox: { [name: string]: number; }
    voiceVoxEnabled: boolean
    openTTSEnabled: boolean
}

export type ResourceManagerStateAndMethod = ResourceManagerState & {
    fetchPSD: (filename: string) => Promise<ArrayBuffer>

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
    const { applicationSetting } = useAppSetting()
    const [voiceVoxEnabled, setVoiceVoxEnabled] = useState<boolean>(applicationSetting!.voicevox_setting.voicevox_enabled)
    const [openTTSEnabled, setOpenTTSEnabled] = useState<boolean>(applicationSetting!.voicevox_setting.open_tts_enabled)
    const [speakersInOpenTTS, setSpeakers] = useState<{ [lang: string]: string[] }>({})
    const [speakersInVoiceVox, setSpeakersInVoiceVox] = useState<{ [name: string]: number }>({})
    const voiceSetting = applicationSetting!.voicevox_setting

    const fetchPSD = async (filename: string) => {
        return ResourceLoader.fetchPSD(filename)
    }

    const refreshSpeakersInVoiceVox = async () => {
        const speakers = await ResourceLoader.getSpeakerListFromVoiceVox(voiceSetting.voicevox_url)
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
        const languages = await ResourceLoader.getLanguageListFromOpenTTS(voiceSetting.open_tts_url) as string[]
        const tmpSpeakers: { [lang: string]: string[] } = {}
        for (const lang of languages) {
            const speakers = await ResourceLoader.getSpeakerListFromOpenTTS(voiceSetting.open_tts_url, lang)
            let names = Object.keys(speakers)
            const notEspeaks = names.filter(x => { return x.indexOf("espeak") < 0 })
            if (notEspeaks.length > 0) {
                names = notEspeaks
            }
            tmpSpeakers[lang] = names
        }
        setSpeakers({ ...tmpSpeakers })
    }
    useEffect(() => {
        refreshLanguageAndSpeakersInOpenTTS()
    }, [])

    const generateVoiceWithVoiceVox = (speakerId: number, text: string) => {
        return ResourceLoader.generateVoiceWithVoiceVox(voiceSetting.voicevox_url, speakerId, text)
    }
    const generateVoiceWithOpenTTS = (lang: string, speakerId: string, text: string) => {
        return ResourceLoader.generateVoiceWithOpenTTS(voiceSetting.open_tts_url, lang, speakerId, text)
    }

    return {
        speakersInOpenTTS,
        speakersInVoiceVox,
        voiceVoxEnabled,
        openTTSEnabled,
        fetchPSD,
        setVoiceVoxEnabled,
        setOpenTTSEnabled,
        fetchMotion: ResourceLoader.fetchMotion,
        fetchVoice: ResourceLoader.fetchVoice,
        generateVoiceWithVoiceVox,
        generateVoiceWithOpenTTS,
        refreshSpeakersInVoiceVox,
        refreshLanguageAndSpeakersInOpenTTS
    }
}