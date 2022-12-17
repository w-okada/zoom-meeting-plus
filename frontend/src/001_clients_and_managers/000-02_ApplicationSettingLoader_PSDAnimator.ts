export type PSDAnimatorSetting =
    {
        "psd_animation": PSDAnimationFrame[],
        "psd_url": string,
    }

export type PSDAnimationFrame = {
    "mode": string,
    "z_index": number,
    "number": number,
    "layer_path": string
}
