import React, { useEffect, useMemo } from "react";
import { useAppState } from "../003_provider/003_AppStateProvider";
import { RightSidebar } from "./100-2_RightSidebar";
import { Dialog } from "./101_Dialog";

export const Frame = () => {
    const { frontendManagerState } = useAppState();

    //// initial
    useEffect(() => {
        frontendManagerState.stateControls.openRightSidebarCheckbox.updateState(true);
        frontendManagerState.stateControls.entranceDialogCheckbox.updateState(true);
    }, []);
    const iframe = useMemo(() => {
        return <></>;
    }, []);
    return (
        <>
            <RightSidebar />
            <Dialog />
            {iframe}
        </>
    );
};
