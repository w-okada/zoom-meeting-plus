import React, { useContext } from "react";
import { ReactNode } from "react";
import { DeviceManagerStateAndMethod, useDeviceManager } from "../002_hooks/301_useDeviceManager";
import { BackendManagerStateAndMethod, useBackendManager } from "../002_hooks/002_useBackendManager";
import { FrontendManagerStateAndMethod, useFrontendManager } from "../002_hooks/100_useFrontendManager";
import { ThreeStateAndMethods, useThree } from "../002_hooks/110_useThree";
import { TimeKeeperStateAndMethod, useTimeKeeper } from "../002_hooks/120_useTimeKeeper";
import { ResourceManagerStateAndMethod, useResourceManager } from "../002_hooks/003_useResourceManager";
import { AvatarControlStateAndMethod, useAvatarControl } from "../002_hooks/111_useAvatarControl";
import { useZoomSDK, ZoomSDKStateAndMethod } from "../002_hooks/200_useZoomSDK";
import { BrowserProxyStateAndMethod, useBrowserProxy } from "../002_hooks/300_useBrowserProxy";
import { MotionPlayerStateAndMethod, useMotionPlayer } from "../002_hooks/303_useMotionPlayer";
type Props = {
    children: ReactNode;
};

interface AppStateValue {
    backendManagerState: BackendManagerStateAndMethod;
    resourceManagerState: ResourceManagerStateAndMethod;
    threeState: ThreeStateAndMethods;
    avatarControlState: AvatarControlStateAndMethod;
    timeKeeperState: TimeKeeperStateAndMethod;

    zoomSDKState: ZoomSDKStateAndMethod;
    browserProxyState: BrowserProxyStateAndMethod;
    deviceManagerState: DeviceManagerStateAndMethod;
    motionPlayerState: MotionPlayerStateAndMethod;

    frontendManagerState: FrontendManagerStateAndMethod;
}

const AppStateContext = React.createContext<AppStateValue | null>(null);
export const useAppState = (): AppStateValue => {
    const state = useContext(AppStateContext);
    if (!state) {
        throw new Error("useAppState must be used within AppStateProvider");
    }
    return state;
};

export const AppStateProvider = ({ children }: Props) => {
    // (1) load data
    const backendManagerState = useBackendManager();
    const resourceManagerState = useResourceManager();
    // (2) initialize
    const threeState = useThree();
    const avatarControlState = useAvatarControl({
        vrm: threeState.character,
        scene: threeState.scene,
    });
    const timeKeeperState = useTimeKeeper();
    const zoomSDKState = useZoomSDK();
    const browserProxyState = useBrowserProxy();
    const deviceManagerState = useDeviceManager();
    const frontendManagerState = useFrontendManager();
    const motionPlayerState = useMotionPlayer({ resourceManagerState });

    const providerValue = {
        deviceManagerState,
        backendManagerState,
        resourceManagerState,
        threeState,
        avatarControlState,
        timeKeeperState,
        zoomSDKState,
        browserProxyState,
        motionPlayerState,
        frontendManagerState,
    };

    return <AppStateContext.Provider value={providerValue}>{children}</AppStateContext.Provider>;
};
