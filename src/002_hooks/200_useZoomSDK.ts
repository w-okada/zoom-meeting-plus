import ZoomMtgEmbedded from "@zoomus/websdk/embedded";
import { useMemo, useState } from "react";
import { GenerateSignatureRequest } from "../001_clients_and_managers/002_SignerClient";
import { useAppSetting } from "../003_provider/AppSettingProvider";
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
    const { applicationSetting } = useAppSetting()
    const defaultMeetingSetting = applicationSetting!.default_meeting
    const signServerSetting = applicationSetting!.sign_server
    const [isJoined, setIsJoined] = useState<boolean>(false)
    const client = useMemo(() => {
        return ZoomMtgEmbedded.createClient();
    }, []);

    const joinZoom = useMemo(() => {
        console.log("joinZoom!!!!!")
        if (!props.backendManagerState) {
            return null
        }
        return async (_username: string, _meetingNumber: string, _password: string, _secret: string) => {
            const username = defaultMeetingSetting.default_username.length > 0 ? defaultMeetingSetting.default_username : _username;
            const meetingNumber = defaultMeetingSetting.default_meeting_number.length > 0 ? defaultMeetingSetting.default_meeting_number : _meetingNumber;
            const meetingPassword = defaultMeetingSetting.default_meeting_password.length > 0 ? defaultMeetingSetting.default_meeting_password : _password;
            const secret = defaultMeetingSetting.default_secret.length > 0 ? defaultMeetingSetting.default_secret : _secret;
            console.log("", secret);

            const sigParams: GenerateSignatureRequest = {
                meetingNumber: meetingNumber,
                role: "0",
                secret: "1000", //secret,
            };
            const signature = await props.backendManagerState.generateSignature(signServerSetting.use_local_sign_server, signServerSetting.sign_server_url, sigParams);
            // console.log("generated Signature", sigParams, signature);

            const params = {
                sdkKey: signature.sdkKey,
                signature: signature.signature,
                meetingNumber: meetingNumber,
                password: meetingPassword,
                userName: username,
            };
            // console.log("params", params);
            const meetingSDKElement = document.getElementById("meetingSDKElement");
            client.init({ zoomAppRoot: meetingSDKElement!, language: "en-US" });
            const result = await client.join(params);
            console.log("zoom joined:", result)
            setIsJoined(true)
        };
    }, [props.backendManagerState.generateSignature])

    const retVal: ZoomSDKStateAndMethod = {
        isJoined,
        joinZoom
    }
    return retVal;
}