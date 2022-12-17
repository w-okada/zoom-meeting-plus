import { useEffect, useMemo, useState } from "react"
import { ApplicationSetting, fetchApplicationSetting, InitialApplicationSetting } from "../001_clients_and_managers/000_ApplicationSettingLoader"
import { IndexedDBStateAndMethod } from "./001_useIndexedDB"

export type ApplicationSettingManagerStateAndMethod = {
    applicationSetting: ApplicationSetting
    accessToken: string
    zak: string

    setIndexedDb: (val: IndexedDBStateAndMethod) => void
}

export const useApplicationSettingManager = (): ApplicationSettingManagerStateAndMethod => {
    const [applicationSetting, setApplicationSetting] = useState<ApplicationSetting>(InitialApplicationSetting)
    const [_indexedDb, setIndexedDb] = useState<IndexedDBStateAndMethod>() // ApplicationSettingProviderからsetされる。
    const accessToken = useMemo(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('accessToken') || ""
    }, [])
    const zak = useMemo(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('zak') || ""
    }, [])

    useEffect(() => {
        const loadApplicationSetting = async () => {
            const setting = await fetchApplicationSetting()
            setApplicationSetting(setting)
        }
        loadApplicationSetting()
    }, [])

    return {
        applicationSetting,
        accessToken,
        zak,

        setIndexedDb

    }
}

