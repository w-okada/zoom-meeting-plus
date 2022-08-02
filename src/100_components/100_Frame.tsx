import React, { useEffect, useMemo } from "react";
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
    const iframe = useMemo(() => {
        return (
            <></>
            // <div className="inner-index-container">
            //     <iframe id="inner-index" title="inner" className="inner-index" src="./inner-index.html"></iframe>
            // </div>
        );
    }, []);
    return (
        <>
            <RightSidebar />
            <Dialog />
            {iframe}
        </>
    );
};
