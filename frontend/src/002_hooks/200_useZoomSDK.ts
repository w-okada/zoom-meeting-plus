import { useMemo } from "react";
import { ZoomMeetingPlusInitEvent, ZoomMeetingPlusJoinEvent } from "../sharedTypes";

export type ZoomSDKStateAndMethod = {
    initZoomClient: () => Promise<void>
    joinZoom: (username: string, meetingNumber: string, password: string, signature: string, sdkKey: string) => Promise<void>
}
export const useZoomSDK = (): ZoomSDKStateAndMethod => {

    const initZoomClient = useMemo(() => {
        return async () => {
            // window.ZoomMtg.preLoadWasm()
            // window.ZoomMtg.prepareWebSDK()
            // window.ZoomMtg.i18n.load('en-US')
            // window.ZoomMtg.i18n.reload('en-US')

            // console.log("ZOOM_MTG_INIT_0")
            // const p = new Promise<void>((resolve, reject) => {
            //     window.ZoomMtg.init({
            //         leaveUrl: "./",
            //         success: (success: any) => {
            //             console.log("ZOOM_MTG_INIT_1")
            //             console.log(success)
            //             resolve()
            //         },
            //         error: (error: any) => {
            //             console.log("ZOOM_MTG_INIT_2")
            //             console.warn(error)
            //             reject(error)
            //         }
            //     })
            // })
            // await p

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
        }
    }, [])

    const joinZoom = useMemo(() => {
        return async (username: string, meetingNumber: string, password: string, signature: string, sdkKey: string) => {
            // const p = new Promise<void>((resolve, reject) => {
            //     window.ZoomMtg.join({
            //         signature: signature,
            //         meetingNumber: meetingNumber,
            //         userName: username,
            //         sdkKey: sdkKey,
            //         passWord: password,
            //         success: (success: any) => {
            //             console.log("ZOOM_MTG_INIT3")
            //             console.log(success)
            //             resolve()
            //         },
            //         error: (error: any) => {
            //             console.log("ZOOM_MTG_INIT4")
            //             console.warn(error)
            //             reject(error)
            //         }
            //     })
            // })
            // await p;

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const ifrm = document.getElementById('inner-index')!.contentWindow;
            const message: ZoomMeetingPlusJoinEvent = {
                type: "ZoomMeetingPlusJoinEvent",
                data: {
                    username,
                    meetingNumber,
                    password,
                    signature,
                    sdkKey
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