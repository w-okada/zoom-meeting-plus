import React, { useEffect, useMemo } from "react";
import { useAppState } from "../003_provider/003_AppStateProvider";
import { useStateControlCheckbox } from "./hooks/useStateControlCheckbox";
import { AnimationTypes, HeaderButton, HeaderButtonProps } from "./parts/002_HeaderButton";
import { Header } from "./100-1_Header";

import { VoicevoxSetting } from "./100-2-3_VoicevoxSetting";
import { MMVCSetting } from "./100-2-2_MMVCSetting";
import { AvatarSetting } from "./100-2-1_AvatarSetting";


export const RightSidebar = () => {
    const { frontendManagerState } = useAppState()

    const sidebarAccordionAvatarCheckbox = useStateControlCheckbox("sidebar-accordion-avatar-checkbox");
    const sidebarAccordionMMVCCheckbox = useStateControlCheckbox("sidebar-accordion-mmvc-checkbox");
    const sidebarAccordionVoicevoxCheckbox = useStateControlCheckbox("sidebar-accordion-voicevox-checkbox");

    /**
     * (1)According Actions
     */
    //// (1-1) accordion button for avatar
    const accodionButtonForAvatar = useMemo(() => {
        const accodionButtonForAvatarProps: HeaderButtonProps = {
            stateControlCheckbox: sidebarAccordionAvatarCheckbox,
            tooltip: "Open/Close",
            onIcon: ["fas", "caret-up"],
            offIcon: ["fas", "caret-up"],
            animation: AnimationTypes.spinner,
            tooltipClass: "tooltip-right",
        };
        return <HeaderButton {...accodionButtonForAvatarProps}></HeaderButton>;
    }, []);
    //// (1-2) accordion button for mmvc
    const accodionButtonForMMVC = useMemo(() => {
        const accodionButtonForMMVCProps: HeaderButtonProps = {
            stateControlCheckbox: sidebarAccordionMMVCCheckbox,
            tooltip: "Open/Close",
            onIcon: ["fas", "caret-up"],
            offIcon: ["fas", "caret-up"],
            animation: AnimationTypes.spinner,
            tooltipClass: "tooltip-right",
        };
        return <HeaderButton {...accodionButtonForMMVCProps}></HeaderButton>;
    }, []);
    //// (1-3) accordion button for voicevox
    const accodionButtonForVoicevox = useMemo(() => {
        const accodionButtonForVoicevoxProps: HeaderButtonProps = {
            stateControlCheckbox: sidebarAccordionVoicevoxCheckbox,
            tooltip: "Open/Close",
            onIcon: ["fas", "caret-up"],
            offIcon: ["fas", "caret-up"],
            animation: AnimationTypes.spinner,
            tooltipClass: "tooltip-right",
        };
        return <HeaderButton {...accodionButtonForVoicevoxProps}></HeaderButton>;
    }, []);
    /**
     * (2)According Initial State
     */
    useEffect(() => {
        sidebarAccordionAvatarCheckbox.updateState(true);
        sidebarAccordionMMVCCheckbox.updateState(true);
        sidebarAccordionVoicevoxCheckbox.updateState(true);
    }, []);


    //////////////////
    // Rendering   ///
    //////////////////
    return (
        <>
            {frontendManagerState.stateControls.openRightSidebarCheckbox.trigger}
            <div className="right-sidebar">
                <Header></Header>
                {sidebarAccordionAvatarCheckbox.trigger}
                <div className="sidebar-partition">
                    <div className="sidebar-header">
                        <div className="sidebar-header-title"> Avatar</div>
                        <div className="sidebar-header-caret"> {accodionButtonForAvatar}</div>
                    </div>
                    <AvatarSetting></AvatarSetting>
                </div>
                {sidebarAccordionMMVCCheckbox.trigger}
                <div className="sidebar-partition">
                    <div className="sidebar-header">
                        <div className="sidebar-header-title">MMVC Seting</div>
                        <div className="sidebar-header-caret"> {accodionButtonForMMVC}</div>
                    </div>
                    <MMVCSetting></MMVCSetting>
                </div>
                {sidebarAccordionVoicevoxCheckbox.trigger}
                <div className="sidebar-partition">
                    <div className="sidebar-header">
                        <div className="sidebar-header-title">Voicevox setting</div>
                        <div className="sidebar-header-caret"> {accodionButtonForVoicevox}</div>
                    </div>
                    <VoicevoxSetting></VoicevoxSetting>
                </div>
            </div>
        </>
    );
};
