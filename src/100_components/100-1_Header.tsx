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

        // ///// (5-2) transcribe
        // const commentButtonProps: HeaderButtonProps = {
        //     stateControlCheckbox: frontendManagerState.stateControls.startTranscribeCheckbox,
        //     tooltip: "post to slack",
        //     onIcon: ["fas", "comments"],
        //     offIcon: ["fas", "comments"],
        //     animation: AnimationTypes.colored,
        // };
        // const commentButton = <HeaderButton {...commentButtonProps}></HeaderButton>;

        ///// (5-3) appinfo
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
            // commentButton,
            appInfoButton,
        };
    }, []);

    const header = useMemo(() => {
        // (X) Header
        const header = (
            <div className="header">
                <div className="sidebar-button-area">v0023</div>
                <div className="status-area">{applicationTitle}</div>
                <div className="menu-item-area">
                    <div className="group">
                        {/* {buttons.commentButton} */}
                        {buttons.settingButton}
                        {buttons.appInfoButton}
                    </div>
                    <div className="group">{buttons.rightSidebarButton}</div>
                </div>
            </div>
        );
        return header;
    }, []);

    return header;
};
