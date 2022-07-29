import React, { useMemo } from "react";
import { useAppSetting } from "../003_provider/AppSettingProvider";
import { useAppState } from "../003_provider/AppStateProvider";
import { AnimationTypes, HeaderButton, HeaderButtonProps } from "./parts/002_HeaderButton";

type HeaderButtons = {
    rightSidebarButton: JSX.Element;
    settingButton: JSX.Element;
    // commentButton: JSX.Element;
    appInfoButton: JSX.Element;
};
export const Header = () => {
    const { frontendManagerState } = useAppState();
    const { applicationSetting } = useAppSetting();
    const applicationTitle = applicationSetting!.app_title;

    const buttons: HeaderButtons = useMemo(() => {
        //// (1) Frame
        ///// (1-3) Right Sidebar
        const rightSidebarButtonProps: HeaderButtonProps = {
            stateControlCheckbox: frontendManagerState.stateControls.openRightSidebarCheckbox,
            tooltip: "open/close",
            onIcon: ["fas", "angles-right"],
            offIcon: ["fas", "angles-right"],
            animation: AnimationTypes.spinner,
        };
        const rightSidebarButton = <HeaderButton {...rightSidebarButtonProps}></HeaderButton>;

        //// (5) Dialog
        ///// (5-1) setting
        const settingButtonProps: HeaderButtonProps = {
            stateControlCheckbox: frontendManagerState.stateControls.settingDialogCheckbox,
            tooltip: "setting",
            onIcon: ["fas", "gear"],
            offIcon: ["fas", "gear"],
            animation: AnimationTypes.colored,
        };
        const settingButton = <HeaderButton {...settingButtonProps}></HeaderButton>;

        ///// (5-2) appinfo
        const appInfoButtonProps: HeaderButtonProps = {
            stateControlCheckbox: frontendManagerState.stateControls.appInfoDialogCheckbox,
            tooltip: "info",
            onIcon: ["fas", "circle-info"],
            offIcon: ["fas", "circle-info"],
            animation: AnimationTypes.colored,
        };
        const appInfoButton = <HeaderButton {...appInfoButtonProps}></HeaderButton>;

        return {
            rightSidebarButton,
            settingButton,
            appInfoButton,
        };
    }, []);

    const header = useMemo(() => {
        // (X) Header
        const header = (
            <div className="header">
                {applicationTitle}
                <div className="header-partition">
                    {buttons.settingButton}
                    {buttons.appInfoButton}
                </div>
                <div className="header-spacer-for-toggle"></div>
                <div className="header-fixed-sidebar-toggle">{buttons.rightSidebarButton}</div>
            </div>
        );
        return header;
    }, []);

    return header;
};
