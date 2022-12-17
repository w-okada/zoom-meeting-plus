import React, { useContext } from "react";
import { ReactNode } from "react";
import { ApplicationSettingManagerStateAndMethod, useApplicationSettingManager } from "../002_hooks/000_useApplicationSettingManager";
type Props = {
    children: ReactNode;
};

interface AppSettingValue {
    applicationSettingState: ApplicationSettingManagerStateAndMethod;
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

    const providerValue = {
        applicationSettingState,
    };

    return <AppSettingContext.Provider value={providerValue}>{children}</AppSettingContext.Provider>;
};
