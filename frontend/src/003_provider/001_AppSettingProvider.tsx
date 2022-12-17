import React, { useContext, useEffect } from "react";
import { ReactNode } from "react";
import { ApplicationSettingManagerStateAndMethod, useApplicationSettingManager } from "../002_hooks/000_useApplicationSettingManager";
import { useIndexedDB } from "../002_hooks/001_useIndexedDB";

type Props = {
    children: ReactNode;
};

interface AppSettingValue {
    applicationSettingState: ApplicationSettingManagerStateAndMethod
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
    const providerValue = {
        applicationSettingState
    };
    useEffect(() => {
        applicationSettingState.setIndexedDb(indexedDBState);
    }, [indexedDBState.setItem, indexedDBState.getItem]);

    return <AppSettingContext.Provider value={providerValue}>{children}</AppSettingContext.Provider>;
};
