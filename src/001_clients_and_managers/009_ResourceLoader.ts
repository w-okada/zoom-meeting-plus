import { VOICEV_VOX_URL } from "../const";

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

export const generateVoice = async (speakerId: number, text: string) => {
    const url = `${VOICEV_VOX_URL}/audio_query?speaker=${speakerId}&text=${encodeURIComponent(text)}`
    console.log(url)

    const res = await fetch(url, {
        method: "POST",
    });
    const json = await res.json()
    console.log(json)

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
    console.log(blob)
    return blob;
}