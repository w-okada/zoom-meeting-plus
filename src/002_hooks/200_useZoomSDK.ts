import ZoomMtgEmbedded from "@zoomus/websdk/embedded";
import { useMemo, useState } from "react";
import { GenerateSignatureRequest } from "../001_clients_and_managers/002_SignerClient";
import { DEFAULT_MEETING_NUMBER, DEFAULT_MEETING_PASSWORD, DEFAULT_SECRET, DEFAULT_USERNAME } from "../const";
import { BackendManagerStateAndMethod } from "./002_useBackendManager";

export type UseZoomSDKProps = {
    backendManagerState: BackendManagerStateAndMethod
}

export type ZoomSDKState = {
    isJoined: boolean
}
export type ZoomSDKStateAndMethod = ZoomSDKState & {
    joinZoom: ((_username: string, _meetingNumber: string, _password: string, _secret: string) => Promise<void>) | null
}
export const useZoomSDK = (props: UseZoomSDKProps): ZoomSDKStateAndMethod => {
    const [isJoined, setIsJoined] = useState<boolean>(false)
    const client = useMemo(() => {
        return ZoomMtgEmbedded.createClient();
    }, []);

    const joinZoom = useMemo(() => {
        if (!props.backendManagerState) {
            return null
        }
        return async (_username: string, _meetingNumber: string, _password: string, _secret: string) => {
            const username = DEFAULT_USERNAME.length > 0 ? DEFAULT_USERNAME : _username;
            const meetingNumber = DEFAULT_MEETING_NUMBER.length > 0 ? DEFAULT_MEETING_NUMBER : _meetingNumber;
            const meetingPassword = DEFAULT_MEETING_PASSWORD.length > 0 ? DEFAULT_MEETING_PASSWORD : _password;
            const secret = DEFAULT_SECRET.length > 0 ? DEFAULT_SECRET : _secret;
            console.log("", secret);

            const meetingSDKElement = document.getElementById("meetingSDKElement");
            client.init({ zoomAppRoot: meetingSDKElement!, language: "en-US" });

            const sigParams: GenerateSignatureRequest = {
                meetingNumber: meetingNumber,
                role: "0",
                secret: "1000", //secret,
            };
            const signature = await props.backendManagerState.generateSignature(sigParams);
            // console.log("generated Signature", sigParams, signature);

            const params = {
                sdkKey: signature.sdkKey,
                signature: signature.signature,
                meetingNumber: meetingNumber,
                password: meetingPassword,
                userName: username,
            };
            // console.log("params", params);
            const result = await client.join(params);
            console.log("zoom joined:", result)
            setIsJoined(true)
        };
    }, [props.backendManagerState])

    const retVal: ZoomSDKStateAndMethod = {
        isJoined,
        joinZoom
    }
    return retVal;
}