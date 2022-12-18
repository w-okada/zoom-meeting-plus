import { useMemo } from "react";
import { useAppSetting } from "../003_provider/001_AppSettingProvider";
import { ZoomMeetingPlusInitEvent, ZoomMeetingPlusJoinEvent } from "../sharedTypes";

export type ZoomSDKStateAndMethod = {
    initZoomClient: () => Promise<void>
    joinZoom: (username: string, meetingNumber: string, password: string, signature: string, sdkKey: string, zak: string) => Promise<void>
}
export const useZoomSDK = (): ZoomSDKStateAndMethod => {
    const { deviceManagerState, applicationSettingState } = useAppSetting()
    const initZoomClient = useMemo(() => {
        return async () => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const ifrm = document.getElementById('inner-index')!.contentWindow;
            const message: ZoomMeetingPlusInitEvent = {
                type: "ZoomMeetingPlusInitEvent",
            }
            const origin = `${location.protocol}//${location.host}/`
            ifrm.postMessage(message, origin);

            const p = new Promise<void>((resolve) => {
                const checkZoomInitialized = () => {
                    if (ifrm.isZoomInitialized()) {
                        resolve()
                    } else {
                        setTimeout(() => {
                            checkZoomInitialized()
                        }, 200)
                    }
                }
                checkZoomInitialized()
            })
            await p

            console.log("init_zoom", origin)

            console.log("Initial DeviceID setting.")
            ifrm.reconstructAudioInputNode(deviceManagerState.audioInputDeviceId, true);
            console.log("Initial MMVC setting.")
            ifrm.changeVoiceChangerSetting(
                applicationSettingState.applicationSetting.mmvc_setting.src_id,
                applicationSettingState.applicationSetting.mmvc_setting.dst_id,
                applicationSettingState.applicationSetting.mmvc_setting.gpu,
                applicationSettingState.applicationSetting.mmvc_setting.prefix_chunk_size,
                applicationSettingState.applicationSetting.mmvc_setting.chunk_size
            )
        }
    }, [])

    const joinZoom = useMemo(() => {
        return async (username: string, meetingNumber: string, password: string, signature: string, sdkKey: string, zak: string) => {

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const ifrm = document.getElementById('inner-index')!.contentWindow;
            console.log("ZAK:", zak)
            const message: ZoomMeetingPlusJoinEvent = {
                type: "ZoomMeetingPlusJoinEvent",
                data: {
                    username,
                    meetingNumber,
                    password,
                    signature,
                    sdkKey,
                    zak,
                }
            }
            const origin = `${location.protocol}//${location.host}/`
            ifrm.postMessage(message, origin);
            const p = new Promise<void>((resolve) => {
                const checkZoomJoined = () => {
                    if (ifrm.isZoomJoined()) {
                        resolve()
                    } else {
                        setTimeout(() => {
                            checkZoomJoined()
                        }, 200)
                    }
                }
                checkZoomJoined()
            })
            await p
            console.log("join_zoom", origin)
        };
    }, [])


    const retVal: ZoomSDKStateAndMethod = {
        initZoomClient,
        joinZoom
    }
    return retVal;
}