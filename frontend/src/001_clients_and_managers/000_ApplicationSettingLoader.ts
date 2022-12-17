import { MMVCSetting } from "./000-01_ApplicationSettingLoader_MMVC"
import { PSDAnimatorSetting } from "./000-02_ApplicationSettingLoader_PSDAnimator"
import { VoiceVoxSetting } from "./000-03_ApplicationSettingLoader_VoiceVox"
export type ApplicationSetting =
    {
        "app_title": string,
        "default_meeting": {
            "default_username": string,
            "default_meeting_number": string,
            "default_meeting_password": string,
            "default_secret": string
        },
        "sign_server": {
            "use_local_sign_server": boolean,
            "sign_server_url": string
        },
        "oauth": {
            "oauth_url": string,
            "client_id": string,
            "redirect_url": string,
            "get_zak_url": string,
        },
        "mmvc_setting": MMVCSetting,
        "voicevox_setting": VoiceVoxSetting,
        "psd_animator_setting": PSDAnimatorSetting
    }



export const fetchApplicationSetting = async (): Promise<ApplicationSetting> => {
    const url = `/api/setting`
    const res = await fetch(url, {
        method: "GET"
    });
    const setting = await res.json() as ApplicationSetting
    return setting;
}

