import React, { useEffect } from "react";
import { useAppState } from "../003_provider/AppStateProvider";
import { Header } from "./100-1_Header";
import { RightSidebar } from "./100-2_RightSidebar";
import { MainArea } from "./100-3_MainArea";
import { Dialog } from "./101_Dialog";
import { useTimeKeeperClient } from "./hooks/useTimeKeeperClient";

export const Frame = () => {
    const { frontendManagerState } = useAppState();
    useTimeKeeperClient();

    //// initial
    useEffect(() => {
        frontendManagerState.stateControls.openRightSidebarCheckbox.updateState(true);
    }, []);
    return (
        <>
            <Header />
            <RightSidebar />
            <MainArea />
            <Dialog />
        </>
    );
};
