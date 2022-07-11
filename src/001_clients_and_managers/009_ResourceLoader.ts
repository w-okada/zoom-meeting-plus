import { OPEN_TTS_URL, VOICEV_VOX_URL } from "../const";

export const fetchMotion = async (filename: string) => {
    const url = `/motions/${filename}`
    const res = await fetch(url, {
        method: "GET"
    });
    const json = await res.json()
    console.log(json)
    return json;
}

export const fetchVoice = async (filename: string) => {
    const url = `/voices/${filename}`
    const res = await fetch(url, {
        method: "GET"
    });
    const blob = await res.blob()
    console.log(blob)
    return blob;
};


// Voice Vox
export const getSpeakerListFromVoiceVox = async () => {
    const url = `${VOICEV_VOX_URL}/speakers`
    const res = await fetch(url, {
        method: "GET"
    });
    const json = await res.json()
    console.log(json)
    return json;
}

export const generateVoiceWithVoiceVox = async (speakerId: number, text: string) => {
    const url = `${VOICEV_VOX_URL}/audio_query?speaker=${speakerId}&text=${encodeURIComponent(text)}`
    console.log(url)

    const res = await fetch(url, {
        method: "POST",
    });
    const json = await res.json()
    // console.log(json)

    const url2 = `${VOICEV_VOX_URL}/synthesis?speaker=${speakerId}`
    const res2 = await fetch(url2, {
        method: "POST",
        body: JSON.stringify(json),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    });
    const blob = await res2.blob()
    // console.log(blob)
    return blob;
}


// OpenTTS
export const getLanguageListFromOpenTTS = async () => {
    const url = `${OPEN_TTS_URL}/api/languages`
    const res = await fetch(url, {
        method: "GET"
    });
    const json = await res.json()
    // console.log(json)
    return json;
}

export const getSpeakerListFromOpenTTS = async (lang: string) => {
    const url = `${OPEN_TTS_URL}/api/voices?language=${lang}`
    const res = await fetch(url, {
        method: "GET"
    });
    const json = await res.json()
    // console.log(json)
    return json;
}


export const generateVoiceWithOpenTTS = async (lang: string, speakerId: string, text: string) => {
    const url = `${OPEN_TTS_URL}/api/tts?voice=${speakerId}&lang=${lang}&vocoder=high&denoiserStrength=0.005&text=${text}&speakerId=&ssml=false&ssmlNumbers=true&ssmlDates=true&ssmlCurrency=true&cache=false`
    const res = await fetch(url, {
        method: "GET",
    });
    const blob = await res.blob()
    // console.log(blob)
    return blob;
}


// /api/tts?voice=glow-speak%3Aen-us_mary_ann&lang=en&vocoder=high&denoiserStrength=0.005&text=The%20latest%20version%20may%20not%20be%20stable%20as%20we%20are%20constantly%20updating%20it.%0APlease%20clone%20and%20use%20the%20following%20tag.&speakerId=&ssml=false&ssmlNumbers=true&ssmlDates=true&ssmlCurrency=true&cache=false
