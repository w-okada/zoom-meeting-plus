import { fetchMotion, fetchVoice, generateVoice } from "../001_clients_and_managers/009_ResourceLoader"

export type ResourceManagerAndMethod = {
    fetchMotion: (filename: string) => Promise<any>
    fetchVoice: (filename: string) => Promise<Blob>
    generateVoice: (speakerId: number, text: string) => Promise<Blob>
}
export const useResourceManager = (): ResourceManagerAndMethod => {
    return {
        fetchMotion,
        fetchVoice,
        generateVoice
    }
}