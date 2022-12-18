import { generateConfig, OperationParams, WorkerManager } from "@dannadori/psdanimator";
import React, { useEffect, useMemo, useState } from "react";
import { useAppSetting } from "../003_provider/001_AppSettingProvider";
import { useAppState } from "../003_provider/003_AppStateProvider";

export const AvatarSetting = () => {
    const { resourceManagerState, browserProxyState } = useAppState();
    const { applicationSettingState } = useAppSetting();

    const [motion, setMotion] = useState<string>("normal")
    const psdAnimator = useMemo(() => {
        return new WorkerManager()
    }, [])
    const motionNames = useMemo(() => {
        const names = applicationSettingState.applicationSetting.psd_animator_setting.psd_animation.map(x => { return x.mode })
        const namesDedup = Array.from(new Set(names));
        return namesDedup
    }, [])

    useEffect(() => {
        console.log("set motion")
        if (browserProxyState.voiceValue > 5) {
            const p2: OperationParams = {
                type: "SWITCH_MOTION_MODE",
                motionMode: "talking",
            }
            psdAnimator.execute(p2)

        } else {
            const p2: OperationParams = {
                type: "SWITCH_MOTION_MODE",
                motionMode: motion,
            }
            psdAnimator.execute(p2)
        }
    }, [browserProxyState.voiceValue])

    useEffect(() => {
        const load = async () => {
            const canvasElement = document.getElementById("psd-animation-canvas") as HTMLCanvasElement;
            const psdFile = await resourceManagerState.fetchPSD(applicationSettingState.applicationSetting.psd_animator_setting.psd_url)

            const config = generateConfig(psdFile, canvasElement, 1024, 960, true)
            await psdAnimator.init(config)
            const p1: OperationParams = {
                type: "SET_MOTION",
                motion: applicationSettingState.applicationSetting.psd_animator_setting.psd_animation
            }
            await psdAnimator.execute(p1)
            console.log("set motion")
            const p2: OperationParams = {
                type: "SWITCH_MOTION_MODE",
                // motionMode: "talking",
                motionMode: "normal",
            }
            await psdAnimator.execute(p2)
            console.log("set motion mode")

            const p3: OperationParams = {
                type: "START",
            }
            await psdAnimator.execute(p3)
            console.log("start motion")


            const p4: OperationParams = {
                type: "SET_WAIT_RATE",
                waitRate: 2
            }
            await psdAnimator.execute(p4)
            console.log("start wait rate")
        }
        load()

    }, [])

    const motionButtons = useMemo(() => {

        const b = motionNames.map((m) => {
            const className = motion == m ? "sidebar-content-row-buttons-button-active" : "sidebar-content-row-buttons-button"
            const button = (
                <div
                    key={m}
                    className={className}
                    onClick={async () => {
                        setMotion(m)
                        const p2: OperationParams = {
                            type: "SWITCH_MOTION_MODE",
                            motionMode: m,
                        }
                        psdAnimator.execute(p2)
                    }}
                >
                    {m}
                </div>
            );
            return button;
        });
        return (<>{b}</>)
    }, [motionNames, motion])


    return (
        <>
            <div className="sidebar-content">
                <div className="sidebar-avatar-area">
                    <div id="sidebar-avatar-area" className="sidebar-content-row-card">
                        <canvas id="psd-animation-canvas"></canvas>
                    </div>

                    <div className="sidebar-content-row-3-7">
                        <div className="sidebar-content-row-label">motions</div>
                        <div className="sidebar-content-row-buttons">{motionButtons}</div>

                    </div>
                    <div className="sidebar-content-row-3-7">
                        <div className="sidebar-content-row-label">voice val</div>
                        <div className="sidebar-content-row-label">{browserProxyState.voiceValue}</div>
                    </div>
                </div>
            </div>

        </>
    );
};
