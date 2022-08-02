import { useEffect, useMemo, useState } from "react"
import { ApplicationSetting, fetchApplicationSetting, fetchZak } from "../001_clients_and_managers/000_ApplicationSettingLoader"

export type ApplicationSettingManagerStateAndMethod = {
    applicationSetting: ApplicationSetting | null
    accessToken: string
}

export const useApplicationSettingManager = () => {
    const [applicationSetting, setApplicationSetting] = useState<ApplicationSetting | null>(null)
    const [zak, setZak] = useState<string>("")
    const code = useMemo(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('code') || ""
    }, [])

    useEffect(() => {
        if (code.length === 0 || !applicationSetting) {
            return
        }
        const getZak = async () => {
            const getZakURL = applicationSetting?.oauth.get_zak_url || ""
            const url = `${getZakURL}?code=${code}`
            console.log("URL", url)
            const zak = await fetchZak(url)
            console.log("ZAK!!", zak)
            setZak(zak)
        }
        getZak();
    }, [code, applicationSetting])

    useEffect(() => {
        const loadApplicationSetting = async () => {
            const setting = await fetchApplicationSetting()
            setApplicationSetting(setting)
        }
        loadApplicationSetting()
    }, [])

    return {
        applicationSetting,
        code,
        zak
    }
}

