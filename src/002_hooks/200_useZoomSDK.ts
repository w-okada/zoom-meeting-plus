// import { ZoomMtg } from "@zoomus/websdk";
import ZoomMtgEmbedded from "@zoomus/websdk/embedded";
import { useMemo, useState } from "react";
import { GenerateSignatureRequest } from "../001_clients_and_managers/002_SignerClient";
import { useAppSetting } from "../003_provider/AppSettingProvider";
import { BackendManagerStateAndMethod } from "./002_useBackendManager";

// ZoomMtg.setZoomJSLib('https://source.zoom.us/2.5.0/lib', '/av')
// ZoomMtg.preLoadWasm()
// ZoomMtg.prepareJssdk()
// ZoomMtg.i18n.load('en-US')
// ZoomMtg.i18n.reload('en-US')

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
            const meetingSDKChatElement = document.getElementById("meetingSDKChatElement");
            client.init({
                zoomAppRoot: meetingSDKElement!,
                language: "en-US",
                customize: {
                    video: {
                        isResizable: true,
                        viewSizes: {
                            default: {
                                width: 1000,
                                height: 600
                            },
                            ribbon: {
                                width: 300,
                                height: 700
                            }
                        }
                    },
                    chat: {
                        popper: {
                            disableDraggable: true,
                            anchorElement: meetingSDKChatElement,
                            placement: 'top'
                        }
                    },
                    meetingInfo: [
                        'topic',
                        'host',
                        'mn',
                        'pwd',
                        'telPwd',
                        'invite',
                        'participant',
                        'dc',
                        'enctype',
                    ],
                    toolbar: {
                        buttons: [
                            {
                                text: 'Custom Button',
                                className: 'CustomButton',
                                onClick: () => {
                                    console.log('custom button')
                                }
                            }
                        ]
                    }
                }
            });
            const result = await client.join(params);
            console.log("zoom joined:", result)
            setIsJoined(true)
        };
    }, [props.backendManagerState.generateSignature])


    // const joinZoom = useMemo(() => {
    //     if (!props.backendManagerState) {
    //         return null
    //     }
    //     return async (_username: string, _meetingNumber: string, _password: string, _secret: string) => {
    //         console.log("joinZoom!!!!!")

    //         const username = defaultMeetingSetting.default_username.length > 0 ? defaultMeetingSetting.default_username : _username;
    //         const meetingNumber = defaultMeetingSetting.default_meeting_number.length > 0 ? defaultMeetingSetting.default_meeting_number : _meetingNumber;
    //         const meetingPassword = defaultMeetingSetting.default_meeting_password.length > 0 ? defaultMeetingSetting.default_meeting_password : _password;
    //         const secret = defaultMeetingSetting.default_secret.length > 0 ? defaultMeetingSetting.default_secret : _secret;
    //         console.log("", secret);

    //         const sigParams: GenerateSignatureRequest = {
    //             meetingNumber: meetingNumber,
    //             role: "0",
    //             secret: "1000", //secret,
    //         };
    //         const signature = await props.backendManagerState.generateSignature(signServerSetting.use_local_sign_server, signServerSetting.sign_server_url, sigParams);
    //         // console.log("generated Signature", sigParams, signature);

    //         const params = {
    //             sdkKey: signature.sdkKey,
    //             signature: signature.signature,
    //             meetingNumber: meetingNumber,
    //             password: meetingPassword,
    //             userName: username,
    //         };

    //         console.log("ZOOM_MTG_INIT")
    //         ZoomMtg.init({
    //             leaveUrl: "./leave",
    //             success: (success: any) => {
    //                 console.log("ZOOM_MTG_INIT1")
    //                 console.log(success)

    //                 ZoomMtg.join({
    //                     signature: signature.signature,
    //                     meetingNumber: meetingNumber,
    //                     userName: username,
    //                     sdkKey: signature.sdkKey,
    //                     // userEmail: userEmail,
    //                     passWord: meetingPassword,
    //                     success: (success: any) => {
    //                         console.log("ZOOM_MTG_INIT3")
    //                         console.log(success)
    //                     },
    //                     error: (error: any) => {
    //                         console.log("ZOOM_MTG_INIT4")
    //                         console.warn(error)
    //                     }
    //                 })

    //             },
    //             error: (error: any) => {
    //                 console.log("ZOOM_MTG_INIT2")
    //                 console.warn(error)
    //             }
    //         })
    //         // // console.log("params", params);
    //         // const meetingSDKElement = document.getElementById("meetingSDKElement");
    //         // client.init({ zoomAppRoot: meetingSDKElement!, language: "en-US" });
    //         // const result = await client.join(params);
    //         // console.log("zoom joined:", result)
    //         // setIsJoined(true)
    //     };
    // }, [props.backendManagerState.generateSignature])



    const retVal: ZoomSDKStateAndMethod = {
        isJoined,
        joinZoom
    }
    return retVal;
}