import { generateSignature, GenerateSignatureRequest, GenerateSignatureResult } from "../001_clients_and_managers/002_SignerClient"
export type BackendManagerStateAndMethod = {
    generateSignature: (params: GenerateSignatureRequest) => Promise<GenerateSignatureResult>
}
export const useBackendManager = (): BackendManagerStateAndMethod => {
    return {
        generateSignature,
    }
}