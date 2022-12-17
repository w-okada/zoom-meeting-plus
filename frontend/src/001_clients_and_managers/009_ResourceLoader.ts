
const searchParams = new URLSearchParams(window.location.search)
const debug = searchParams.get('debug') || ""

const DEBUG = debug == "true" ? true : false
const DEBUG_BASE_URL = "http://localhost:18888"

export const fetchTextResource = async (url: string): Promise<string> => {
    const res = await fetch(url, {
        method: "GET"
    });
    const text = res.text()
    return text;
}


export const postVoice = async (url: string, gpu: number, srcId: number, dstId: number, timestamp: number, prefixChunkSize: number, buffer: ArrayBufferLike) => {
    const obj = {
        gpu, srcId, dstId, timestamp, prefixChunkSize, buffer: Buffer.from(buffer).toString('base64')
    };
    const body = JSON.stringify(obj);

    const res = await fetch(`${url}`, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: body
    })

    const receivedJson = await res.json()
    const changedVoiceBase64 = receivedJson["changedVoiceBase64"]
    const buf = Buffer.from(changedVoiceBase64, "base64")
    const ab = new ArrayBuffer(buf.length);
    // console.log("RECIV", buf.length)
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    }
    return ab
}


type FileChunk = {
    hash: number,
    chunk: Blob
}

const uploadLargeFile = async (file: File, onprogress: (progress: number, end: boolean) => void) => {
    const uploadURL = DEBUG ? `${DEBUG_BASE_URL}/upload_file` : `/upload_file`
    onprogress(0, false)
    const size = 1024 * 1024;
    const fileChunks: FileChunk[] = [];
    let index = 0; // index値
    for (let cur = 0; cur < file.size; cur += size) {
        fileChunks.push({
            hash: index++,
            chunk: file.slice(cur, cur + size),
        });
    }

    const chunkNum = fileChunks.length
    console.log("FILE_CHUNKS:", chunkNum, fileChunks)


    while (true) {
        const promises: Promise<void>[] = []
        for (let i = 0; i < 10; i++) {
            const chunk = fileChunks.shift()
            if (!chunk) {
                break
            }
            const p = new Promise<void>((resolve) => {
                const formData = new FormData();
                formData.append("file", chunk.chunk);
                formData.append("filename", `${file.name}_${chunk.hash}`);
                const request = new Request(uploadURL, {
                    method: 'POST',
                    body: formData,
                });
                fetch(request).then(async (response) => {
                    console.log(await response.text())
                    resolve()
                })
            })

            promises.push(p)
        }
        await Promise.all(promises)
        if (fileChunks.length == 0) {
            break
        }
        onprogress(Math.floor(((chunkNum - fileChunks.length) / (chunkNum + 1)) * 100), false)
    }
    return chunkNum
}


export const uploadModelProps = async (modelFile: File, configFile: File, onprogress: (progress: number, end: boolean) => void) => {
    const uploadURL = DEBUG ? `${DEBUG_BASE_URL}/upload_file` : `/upload_file`
    const loadModelURL = DEBUG ? `${DEBUG_BASE_URL}/load_model` : `/load_model`
    onprogress(0, false)

    const chunkNum = await uploadLargeFile(modelFile, (progress: number, _end: boolean) => {
        onprogress(progress, false)
    })
    console.log("model uploaded")


    const configP = new Promise<void>((resolve) => {
        const formData = new FormData();
        formData.append("file", configFile);
        formData.append("filename", configFile.name);
        const request = new Request(uploadURL, {
            method: 'POST',
            body: formData,
        });
        fetch(request).then(async (response) => {
            console.log(await response.text())
            resolve()
        })
    })

    await configP
    console.log("config uploaded")

    const loadP = new Promise<void>((resolve) => {
        const formData = new FormData();
        formData.append("modelFilename", modelFile.name);
        formData.append("modelFilenameChunkNum", "" + chunkNum);
        formData.append("configFilename", configFile.name);
        const request = new Request(loadModelURL, {
            method: 'POST',
            body: formData,
        });
        fetch(request).then(async (response) => {
            console.log(await response.text())
            resolve()
        })
    })
    await loadP
    onprogress(100, true)
    console.log("model loaded")

}



export const fetchPSD = async (filename: string) => {
    const url = `/assets/psd/${filename}`
    const res = await fetch(url, {
        method: "GET"
    });
    return await res.arrayBuffer()
}

export const fetchMotion = async (filename: string) => {
    const url = `/assets/motions/${filename}`
    const res = await fetch(url, {
        method: "GET"
    });
    const json = await res.json()
    console.log(json)
    return json;
}

export const fetchVoice = async (filename: string) => {
    const url = `/assets/voices/${filename}`
    const res = await fetch(url, {
        method: "GET"
    });
    const blob = await res.blob()
    console.log(blob)
    return blob;
};


// Voice Vox
export const getSpeakerListFromVoiceVox = async (voiceVoxUrl: string) => {
    const url = `${voiceVoxUrl}/speakers`
    const res = await fetch(url, {
        method: "GET"
    });
    const json = await res.json()
    console.log(json)
    return json;
}

export const generateVoiceWithVoiceVox = async (voiceVoxUrl: string, speakerId: number, text: string) => {
    const url = `${voiceVoxUrl}/audio_query?speaker=${speakerId}&text=${encodeURIComponent(text)}`
    console.log(url)

    const res = await fetch(url, {
        method: "POST",
    });
    const json = await res.json()
    // console.log(json)

    const url2 = `${voiceVoxUrl}/synthesis?speaker=${speakerId}`
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
export const getLanguageListFromOpenTTS = async (openTtsUrl: string) => {
    const url = `${openTtsUrl}/api/languages`
    const res = await fetch(url, {
        method: "GET"
    });
    const json = await res.json()
    // console.log(json)
    return json;
}

export const getSpeakerListFromOpenTTS = async (openTtsUrl: string, lang: string) => {

    const url = `${openTtsUrl}/api/voices?language=${lang}`
    const res = await fetch(url, {
        method: "GET"
    });
    const json = await res.json()
    // console.log(json)
    return json;
}


export const generateVoiceWithOpenTTS = async (openTtsUrl: string, lang: string, speakerId: string, text: string) => {
    const url = `${openTtsUrl}/api/tts?voice=${speakerId}&lang=${lang}&vocoder=high&denoiserStrength=0.005&text=${text}&speakerId=&ssml=false&ssmlNumbers=true&ssmlDates=true&ssmlCurrency=true&cache=false`
    const res = await fetch(url, {
        method: "GET",
    });
    const blob = await res.blob()
    // console.log(blob)
    return blob;
}


// /api/tts?voice=glow-speak%3Aen-us_mary_ann&lang=en&vocoder=high&denoiserStrength=0.005&text=The%20latest%20version%20may%20not%20be%20stable%20as%20we%20are%20constantly%20updating%20it.%0APlease%20clone%20and%20use%20the%20following%20tag.&speakerId=&ssml=false&ssmlNumbers=true&ssmlDates=true&ssmlCurrency=true&cache=false
