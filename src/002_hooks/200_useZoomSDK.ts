import { useMemo } from "react";

export type ZoomSDKStateAndMethod = {
    initZoomClient: () => Promise<void>
    joinZoom: (username: string, meetingNumber: string, password: string, signature: string, sdkKey: string) => Promise<void>
}
export const useZoomSDK = (): ZoomSDKStateAndMethod => {

    const initZoomClient = useMemo(() => {
        return async () => {
            window.ZoomMtg.preLoadWasm()
            window.ZoomMtg.prepareWebSDK()
            window.ZoomMtg.i18n.load('en-US')
            window.ZoomMtg.i18n.reload('en-US')

            console.log("ZOOM_MTG_INIT_0")
            const p = new Promise<void>((resolve, reject) => {
                window.ZoomMtg.init({
                    leaveUrl: "./",
                    success: (success: any) => {
                        console.log("ZOOM_MTG_INIT_1")
                        console.log(success)
                        resolve()
                    },
                    error: (error: any) => {
                        console.log("ZOOM_MTG_INIT_2")
                        console.warn(error)
                        reject(error)
                    }
                })
            })
            await p
        }
    }, [])

    const joinZoom = useMemo(() => {
        return async (username: string, meetingNumber: string, password: string, signature: string, sdkKey: string) => {
            const p = new Promise<void>((resolve, reject) => {
                window.ZoomMtg.join({
                    signature: signature,
                    meetingNumber: meetingNumber,
                    userName: username,
                    sdkKey: sdkKey,
                    passWord: password,
                    success: (success: any) => {
                        console.log("ZOOM_MTG_INIT3")
                        console.log(success)
                        resolve()
                    },
                    error: (error: any) => {
                        console.log("ZOOM_MTG_INIT4")
                        console.warn(error)
                        reject(error)
                    }
                })
            })
            await p;
        };
    }, [])


    const retVal: ZoomSDKStateAndMethod = {
        initZoomClient,
        joinZoom
    }
    return retVal;
}