import React, { useContext, useEffect } from "react";
import { ReactNode } from "react";
import { ApplicationSettingManagerStateAndMethod, useApplicationSettingManager } from "../002_hooks/000_useApplicationSettingManager";
import { useIndexedDB } from "../002_hooks/001_useIndexedDB";
import { DeviceManagerStateAndMethod, useDeviceManager } from "../002_hooks/301_useDeviceManager";

type Props = {
    children: ReactNode;
};

interface AppSettingValue {
    applicationSettingState: ApplicationSettingManagerStateAndMethod
    deviceManagerState: DeviceManagerStateAndMethod;

}

const AppSettingContext = React.createContext<AppSettingValue | null>(null);
export const useAppSetting = (): AppSettingValue => {
    const state = useContext(AppSettingContext);
    if (!state) {
        throw new Error("useAppSetting must be used within AppSettingProvider");
    }
    return state;
};

export const AppSettingProvider = ({ children }: Props) => {
    const applicationSettingState = useApplicationSettingManager();
    const indexedDBState = useIndexedDB();
    const deviceManagerState = useDeviceManager();
    const providerValue = {
        applicationSettingState,
        deviceManagerState
    };
    useEffect(() => {
        applicationSettingState.setIndexedDb(indexedDBState);
    }, [indexedDBState.setItem, indexedDBState.getItem]);

    return <AppSettingContext.Provider value={providerValue}>{children}</AppSettingContext.Provider>;
};
