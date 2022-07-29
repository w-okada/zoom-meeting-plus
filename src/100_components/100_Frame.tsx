import React, { useEffect } from "react";
import { useAppState } from "../003_provider/AppStateProvider";
import { RightSidebar } from "./100-2_RightSidebar";
import { Dialog } from "./101_Dialog";
import { useTimeKeeperClient } from "./hooks/useTimeKeeperClient";

export const Frame = () => {
    const { frontendManagerState } = useAppState();
    useTimeKeeperClient();

    //// initial
    useEffect(() => {
        frontendManagerState.stateControls.openRightSidebarCheckbox.updateState(true);
        frontendManagerState.stateControls.entranceDialogCheckbox.updateState(true);
    }, []);
    return (
        <>
            <RightSidebar />
            <Dialog />
        </>
    );
};
