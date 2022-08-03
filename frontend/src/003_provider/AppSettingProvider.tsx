import React, { useContext } from "react";
import { ReactNode } from "react";
import { useApplicationSettingManager } from "../002_hooks/000_useApplicationSettingManager";
import { ApplicationSetting } from "../001_clients_and_managers/000_ApplicationSettingLoader";
type Props = {
    children: ReactNode;
};

interface AppSettingValue {
    applicationSetting: ApplicationSetting | null;
    zak: string;
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
    const { applicationSetting, zak } = useApplicationSettingManager();

    const providerValue = {
        applicationSetting,
        zak,
    };

    return <AppSettingContext.Provider value={providerValue}>{children}</AppSettingContext.Provider>;
};
