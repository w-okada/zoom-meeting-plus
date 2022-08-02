export type ApplicationSetting =
    {
        "app_title": string,
        "default_meeting": {
            "default_username": string,
            "default_meeting_number": string,
            "default_meeting_password": string,
            "default_secret": string
        },
        "vrm_path": string,
        "vrm_motions": [
            {
                "name": string,
                "file": string
            }
        ],
        "sign_server": {
            "use_local_sign_server": boolean,
            "sign_server_url": string
        },
        "aouth": {
            "client_id": string,
            "redirect_url": string
        },
        "voice_setting": {
            "default_voice_vox_enabled": boolean,
            "voice_vox_url": string,
            "default_open_tts_enabled": boolean,
            "open_tts_url": string,
            "default_voice_lang": string,
            "default_voice_speaker": string
        }
    }



export const fetchApplicationSetting = async (): Promise<ApplicationSetting> => {
    const url = `/api/setting`
    const res = await fetch(url, {
        method: "GET"
    });
    const setting = await res.json() as ApplicationSetting
    return setting;
}

export const fetchZak = async (token: string) => {
    const url = `https://api.zoom.us/v2/users/me/token?type=zak`
    const res = await fetch(url, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });
    const zak = await res.json()
    return zak;
}
