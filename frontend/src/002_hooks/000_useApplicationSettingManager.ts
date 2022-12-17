import { useEffect, useMemo, useRef, useState } from "react"
import { ApplicationSetting, fetchApplicationSetting, InitialApplicationSetting, MajarModeTypes, PSDAnimationFrame, VoiceChangerMode } from "../001_clients_and_managers/000_ApplicationSettingLoader"
import { IndexedDBStateAndMethod } from "./001_useIndexedDB"



export type ApplicationSettingManagerStateAndMethod = {
    applicationSetting: ApplicationSetting
    accessToken: string
    zak: string
    clearSetting: () => void
    loadApplicationSetting: () => Promise<void>

    setMajarMode: (val: MajarModeTypes) => void
    setVoiceChangerMode: (val: VoiceChangerMode) => void
    setGpu: (val: number) => void
    setSrcSpeakerId: (val: number) => void
    setDstSpeakerId: (val: number) => void
    setPrefixChunkSize: (val: number) => void
    setChunkSize: (val: number) => void
    updateSpeakerMapping: (speakers: {
        "id": number;
        "name": string;
    }[]) => void
    setCrossFadeLowerValue: (val: number) => void
    setCrossFadeOffsetRate: (val: number) => void
    setCrossFadeEndRate: (val: number) => void
    setCrossFadeType: (val: number) => void
    setVoiceChangerServerUrl: (url: string) => void


    setPSDAnimationFrame: (animation: PSDAnimationFrame[]) => void
    setPSDUrl: (url: string) => void

    setVoiceVoxLang: (lang: string) => void
    setVoiceVoxSpeaker: (speaker: string) => void
    setVoiceVoxEnable: (val: boolean) => void
    setVoiceVoxUrl: (url: string) => void

    setIndexedDb: (val: IndexedDBStateAndMethod) => void
}

const LOCAL_STORAGE_PREFIX = "zoom_client"
const LOCAL_STORAGE_APPLICATION_SETTING = `${LOCAL_STORAGE_PREFIX}_applicationSetting`

export const useApplicationSettingManager = (): ApplicationSettingManagerStateAndMethod => {
    const applicationSettingRef = useRef<ApplicationSetting>(InitialApplicationSetting)
    const [applicationSetting, setApplicationSetting] = useState<ApplicationSetting>(applicationSettingRef.current)

    const [indexedDb, setIndexedDb] = useState<IndexedDBStateAndMethod>() // ApplicationSettingProviderからsetされる。
    const [indexedDbLoaded, setIndexedDbLoaded] = useState<boolean>(false)

    const accessToken = useMemo(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('accessToken') || ""
    }, [])
    const zak = useMemo(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('zak') || ""
    }, [])


    /** (1) Initialize Setting */
    /** (1-1) Load from localstorage */
    const loadApplicationSetting = async () => {
        if (localStorage[LOCAL_STORAGE_APPLICATION_SETTING]) {
            applicationSettingRef.current = JSON.parse(localStorage[LOCAL_STORAGE_APPLICATION_SETTING]) as ApplicationSetting
            console.log("Application setting is loaded from local", applicationSettingRef.current)
            setApplicationSetting({ ...applicationSettingRef.current })
        } else {
            applicationSettingRef.current = await fetchApplicationSetting()
            console.log("Application setting is loaded from server", applicationSettingRef.current)
            setApplicationSetting({ ...applicationSettingRef.current })
        }
    }

    useEffect(() => {
        loadApplicationSetting()
    }, [])


    /** (1-2) Load from indexedDb */
    useEffect(() => {
        // indexedDbとappliationSettingが初期化されるまで実行しない。
        // indexedDbはApplicationSettingProviderからsetされる
        if (!indexedDb || !applicationSetting) {
            return
        }
        // indexedDbがloadされてない場合だけ実行する。
        if (indexedDbLoaded) {
            return
        }

        const loadIndexDb = async () => {
            const psdUrl = await indexedDb.getItem("psd_animator_setting.psd_url") as string
            if (psdUrl) {
                applicationSettingRef.current.psd_animator_setting.psd_url = psdUrl
            }

            setIndexedDbLoaded(true)
            setApplicationSetting({ ...applicationSettingRef.current })
        }
        loadIndexDb()
    }, [applicationSetting, indexedDb, indexedDbLoaded])

    /** (2) Clear Setting */
    const clearSetting = async () => {
        localStorage.removeItem(LOCAL_STORAGE_APPLICATION_SETTING)
        await indexedDb!.removeItem("psd_animator_setting.psd_url")
        await loadApplicationSetting()
        setIndexedDbLoaded(false)
    }


    /** (3) Setter */
    /** (3-1) Common */
    const updateApplicationSetting = () => {
        const tmpApplicationSetting = JSON.parse(JSON.stringify(applicationSettingRef.current)) as ApplicationSetting
        if (tmpApplicationSetting.psd_animator_setting.psd_url.length > 1024 * 1024) {
            tmpApplicationSetting.psd_animator_setting.psd_url = ""
        }
        localStorage[LOCAL_STORAGE_APPLICATION_SETTING] = JSON.stringify(tmpApplicationSetting)

        setApplicationSetting({ ...applicationSettingRef.current })
    }

    /** (3-2) VoiceChanger */
    const setMajarMode = (val: MajarModeTypes) => {
        applicationSettingRef.current.mmvc_setting.majar_mode = val
        updateApplicationSetting()
    }
    const setVoiceChangerMode = (val: VoiceChangerMode) => {
        applicationSettingRef.current.mmvc_setting.voice_changer_mode = val
        updateApplicationSetting()
    }
    const setGpu = (val: number) => {
        applicationSettingRef.current.mmvc_setting.gpu = val
        updateApplicationSetting()
    }
    const setSrcSpeakerId = (val: number) => {
        applicationSettingRef.current.mmvc_setting.src_id = val
        updateApplicationSetting()
    }
    const setDstSpeakerId = (val: number) => {
        applicationSettingRef.current.mmvc_setting.dst_id = val
        updateApplicationSetting()
    }
    const setPrefixChunkSize = (val: number) => {
        applicationSettingRef.current.mmvc_setting.prefix_chunk_size = val
        updateApplicationSetting()
    }
    const setChunkSize = (val: number) => {
        applicationSettingRef.current.mmvc_setting.chunk_size = val
        updateApplicationSetting()
    }

    const updateSpeakerMapping = (speakers: {
        "id": number,
        "name": string
    }[]) => {
        applicationSettingRef.current.mmvc_setting.speakers = speakers
        updateApplicationSetting()
    }

    /** (3-2-1) Voice Performance */
    const setCrossFadeLowerValue = (val: number) => {
        applicationSettingRef.current.mmvc_setting.advance.cross_fade_lower_value = val
        updateApplicationSetting()
    }
    const setCrossFadeOffsetRate = (val: number) => {
        applicationSettingRef.current.mmvc_setting.advance.cross_fade_offset_rate = val
        updateApplicationSetting()
    }
    const setCrossFadeEndRate = (val: number) => {
        applicationSettingRef.current.mmvc_setting.advance.cross_fade_end_rate = val
        updateApplicationSetting()
    }
    const setCrossFadeType = (val: number) => {
        applicationSettingRef.current.mmvc_setting.advance.cross_fade_type = val
        updateApplicationSetting()
    }

    /** (3-2-2) voice server */
    const setVoiceChangerServerUrl = (url: string) => {
        applicationSettingRef.current.mmvc_setting.voice_changer_server_url = url
        updateApplicationSetting()
    }

    /** (3-3) PSD Animator */
    const setPSDAnimationFrame = (animation: PSDAnimationFrame[]) => {
        applicationSettingRef.current.psd_animator_setting.psd_animation = animation
        updateApplicationSetting()
    }
    const setPSDUrl = (url: string) => {
        applicationSettingRef.current.psd_animator_setting.psd_url = url
        if (indexedDb) {
            indexedDb.setItem("psd_animator_setting.psd_url", url)
        }
        updateApplicationSetting()
    }

    /** (3-4) VoiceVox */
    const setVoiceVoxLang = (lang: string) => {
        applicationSettingRef.current.voicevox_setting.voice_lang = lang
        updateApplicationSetting()
    }
    const setVoiceVoxSpeaker = (speaker: string) => {
        applicationSettingRef.current.voicevox_setting.voice_speaker = speaker
        updateApplicationSetting()
    }
    const setVoiceVoxEnable = (val: boolean) => {
        applicationSettingRef.current.voicevox_setting.voicevox_enabled = val
        updateApplicationSetting()
    }
    const setVoiceVoxUrl = (url: string) => {
        applicationSettingRef.current.voicevox_setting.voicevox_url = url
        updateApplicationSetting()
    }


    return {
        applicationSetting,
        accessToken,
        zak,
        clearSetting,
        loadApplicationSetting,

        setMajarMode,
        setVoiceChangerMode,
        setGpu,
        setSrcSpeakerId,
        setDstSpeakerId,
        setPrefixChunkSize,
        setChunkSize,
        updateSpeakerMapping,
        setCrossFadeLowerValue,
        setCrossFadeOffsetRate,
        setCrossFadeEndRate,
        setCrossFadeType,
        setVoiceChangerServerUrl,

        setPSDAnimationFrame,
        setPSDUrl,

        setVoiceVoxLang,
        setVoiceVoxSpeaker,
        setVoiceVoxEnable,
        setVoiceVoxUrl,

        setIndexedDb

    }
}

