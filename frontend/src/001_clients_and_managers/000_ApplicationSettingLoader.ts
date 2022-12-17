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
        "majar_mode": MajarModeTypes,
        "voice_changer_server_url": string,
        "sample_rate": number,
        "buffer_size": number,
        "prefix_chunk_size": number,
        "chunk_size": number,
        "speakers": {
            "id": number,
            "name": string
        }[]
        "src_id": number,
        "dst_id": number,
        "vf_enable": boolean,
        "voice_changer_mode": VoiceChangerMode
        "gpu": number
        "available_gpus": number[],
        "advance": {
            "avatar_draw_skip_rate": number,
            "screen_draw_skip_rate": number,
            "visualizer_draw_skip_rate": number,
            "cross_fade_lower_value": number,
            "cross_fade_offset_rate": number,
            "cross_fade_end_rate": number,
            "cross_fade_type": number
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
        "oauth": {
            "oauth_url": string,
            "client_id": string,
            "redirect_url": string,
            "get_zak_url": string,
        },
        "voicevox_setting": VoiceVoxSetting,
        "psd_animator_setting": PSDAnimatorSetting
    }



export const MajarModeTypes = {
    "docker": "docker",
    "colab": "colab",
} as const
export type MajarModeTypes = typeof MajarModeTypes[keyof typeof MajarModeTypes]

export const VoiceChangerMode = {
    "realtime": "realtime",
    "near-realtime": "near-realtime",
} as const
export type VoiceChangerMode = typeof VoiceChangerMode[keyof typeof VoiceChangerMode]


export const fetchApplicationSetting = async (): Promise<ApplicationSetting> => {
    const url = `/api/setting`
    const res = await fetch(url, {
        method: "GET"
    });
    const setting = await res.json() as ApplicationSetting
    return setting;
}

