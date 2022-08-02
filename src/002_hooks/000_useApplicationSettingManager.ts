import { useEffect, useMemo, useState } from "react"
import { ApplicationSetting, fetchApplicationSetting, fetchZak } from "../001_clients_and_managers/000_ApplicationSettingLoader"

export type ApplicationSettingManagerStateAndMethod = {
    applicationSetting: ApplicationSetting | null
    accessToken: string
}

export const useApplicationSettingManager = () => {
    const [applicationSetting, setApplicationSetting] = useState<ApplicationSetting | null>(null)
    const [zak, setZak] = useState<string>("")
    const accessToken = useMemo(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('code') || ""
    }, [])

    useEffect(() => {
        if (accessToken.length === 0) {
            return
        }
        const getZak = async () => {
            const zak = await fetchZak(accessToken)
            console.log("ZAK!!", zak)
            setZak(zak)
        }
        getZak();
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
        zak
    }
}

