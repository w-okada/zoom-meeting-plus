export type MMVCSetting =
    {
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
            "visualizer_draw_skip_rate": number,
            "cross_fade_lower_value": number,
            "cross_fade_offset_rate": number,
            "cross_fade_end_rate": number,
            "cross_fade_type": number
        }
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
