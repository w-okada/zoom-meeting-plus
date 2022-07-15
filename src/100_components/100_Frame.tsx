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
        // const testCanvas = document.getElementById("test") as HTMLCanvasElement;
        // testCanvas.width = 500;
        // testCanvas.height = 500;

        // const ctx = testCanvas.getContext("2d")!;
        // ctx.font = "32px 'ＭＳ ゴシック'";
        // ctx.fillStyle = "Red";
        // const draw = () => {
        //     const d = new Date();

        //     ctx.clearRect(0, 0, 500, 500);
        //     ctx.fillText("AABBCCDD" + d.getTime(), 100, 100);
        //     requestAnimationFrame(draw);
        // };
        // draw();
    }, []);
    return (
        <>
            {/* <canvas id="test"></canvas> */}
            <Header />
            <RightSidebar />
            <MainArea />
            <Dialog />
        </>
    );
};
