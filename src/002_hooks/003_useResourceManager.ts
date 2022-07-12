import { useEffect, useState } from "react"
import * as ResourceLoader from "../001_clients_and_managers/009_ResourceLoader"
import { useAppSetting } from "../003_provider/AppSettingProvider";


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
    const { applicationSetting } = useAppSetting()
    const [voiceVoxEnabled, setVoiceVoxEnabled] = useState<boolean>(applicationSetting!.voice_setting.default_voice_vox_enabled)
    const [openTTSEnabled, setOpenTTSEnabled] = useState<boolean>(applicationSetting!.voice_setting.default_open_tts_enabled)
    const [speakersInOpenTTS, setSpeakers] = useState<{ [lang: string]: string[] }>({})
    const [speakersInVoiceVox, setSpeakersInVoiceVox] = useState<{ [name: string]: number }>({})
    const voiceSetting = applicationSetting!.voice_setting

    const refreshSpeakersInVoiceVox = async () => {
        const speakers = await ResourceLoader.getSpeakerListFromVoiceVox(voiceSetting.voice_vox_url)
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

    const generateVoiceWithVoiceVox = (speakerId: number, text: string) => {
        return ResourceLoader.generateVoiceWithVoiceVox(voiceSetting.voice_vox_url, speakerId, text)
    }
    const generateVoiceWithOpenTTS = (lang: string, speakerId: string, text: string) => {
        return ResourceLoader.generateVoiceWithOpenTTS(voiceSetting.open_tts_url, lang, speakerId, text)
    }

    return {
        speakersInOpenTTS,
        speakersInVoiceVox,
        voiceVoxEnabled,
        openTTSEnabled,
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