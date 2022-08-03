
export const GENERATE_SIGNATURE_LOCAL_URL = "/api/generateSignature";

export type GenerateSignatureRequest = {
    meetingNumber: string;
    role: string;
    secret: string
};
export type GenerateSignatureResult = {
    signature: string;
    sdkKey: string; //	Required, 0 to specify participant, 1 to specify host.
};

export const generateSignature = async (useLocalSignServer: boolean, signServerUrl: string, params: GenerateSignatureRequest): Promise<GenerateSignatureResult> => {
    let url
    if (useLocalSignServer) {
        url = GENERATE_SIGNATURE_LOCAL_URL;
    } else {
        url = `${signServerUrl}`;
    }

    const requestBody = JSON.stringify(params);
    const res = await fetch(url, {
        method: "POST",
        body: requestBody,
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    });
    const response = (await res.json()) as GenerateSignatureResult;
    console.log("SIGN::", response)
    return response;
};

