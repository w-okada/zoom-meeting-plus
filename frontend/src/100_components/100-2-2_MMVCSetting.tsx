import React, { useMemo, useState } from "react";
import { useAppSetting } from "../003_provider/001_AppSettingProvider";
import { useAppState } from "../003_provider/003_AppStateProvider";
import { ModelProps, uploadModelProps } from "../900_inner_utils/999_Utils";
import { DeviceSelector } from "./parts/101_DeviceSelector";


export const MMVCSetting = () => {
    const { applicationSettingState } = useAppSetting()
    const { frontendManagerState, browserProxyState } = useAppState()
    const [modelProps, setModelProps] = useState<ModelProps>({
        modelFile: null,
        configFile: null
    })
    const [modelUploadProgress, setModelUploadProgress] = useState<number>(100)
    const [modelUploadEnd, setModelUploadEnd] = useState<boolean>(true)
    const [voiceChangeEnabled, setVoiceChangeEnabled] = useState<boolean>(false)

    const modelInput = useMemo(() => {
        const onLoadModelClicked = () => {
            const fileChooser = document.createElement("input")
            fileChooser.type = "file"
            fileChooser.onchange = (ev: Event) => {
                if ((ev.currentTarget instanceof HTMLInputElement) == false) {
                    console.log("not input")
                    return
                }
                const target = ev.currentTarget as HTMLInputElement
                console.log("Filename: " + target.files![0].name);
                console.log("Type: " + target.files![0].type);
                console.log("Size: " + target.files![0].size + " bytes");
                if (target.files![0].name.endsWith("pth") == false) {
                    alert("Model file name should end with 'pth'")
                } else {
                    setModelProps({ ...modelProps, modelFile: target.files![0] })
                }
            }
            fileChooser.click()
        }

        const onLoadConfigClicked = () => {
            const fileChooser = document.createElement("input")
            fileChooser.type = "file"
            fileChooser.onchange = (ev: Event) => {
                if ((ev.currentTarget instanceof HTMLInputElement) == false) {
                    console.log("not input")
                    return
                }
                const target = ev.currentTarget as HTMLInputElement
                console.log("Filename: " + target.files![0].name);
                console.log("Type: " + target.files![0].type);
                console.log("Size: " + target.files![0].size + " bytes");

                if (target.files![0].name.endsWith("json") == false) {
                    alert("Config file name should end with 'json'")
                } else {
                    setModelProps({ ...modelProps, configFile: target.files![0] })
                }
            }
            fileChooser.click()
        }

        const onSendClicked = () => {
            if (modelProps.modelFile && modelProps.configFile) {
                // voiceChangerControllerState.sendModelProps()
                uploadModelProps(modelProps.modelFile, modelProps.configFile, (progress: number, end: boolean) => {
                    setModelUploadProgress(progress)
                    setModelUploadEnd(end)
                })
            } else {
                alert("Select model and config.")
            }
        }

        return (
            <>
                <div className="sidebar-content-row-3-5-2">
                    <div className="sidebar-content-row-label">Model:</div>
                    <div className="sidebar-content-row-label">
                        {modelProps.modelFile?.name || "none"}
                    </div>
                    <div className="sidebar-content-row-button" onClick={onLoadModelClicked}>
                        select
                    </div>
                </div>

                <div className="sidebar-content-row-3-5-2">
                    <div className="sidebar-content-row-label">Config:</div>
                    <div className="sidebar-content-row-label">
                        {modelProps.configFile?.name || "none"}
                    </div>
                    <div className="sidebar-content-row-button" onClick={onLoadConfigClicked}>
                        select
                    </div>
                </div>

                <div className="sidebar-content-row-4-3-3">
                    <div className="sidebar-content-row-label"></div>
                    <div className="sidebar-content-row-label">
                        {modelUploadEnd ? "" : modelUploadProgress + "%"}
                    </div>
                    <div className="sidebar-content-row-button" onClick={onSendClicked}>
                        send
                    </div>
                </div>
            </>
        );
    }, [modelProps, modelUploadProgress, modelUploadEnd]);

    // const modeSelectRow = useMemo(() => {
    //     const options = Object.keys(VoiceChangerMode).map((x) => {
    //         return (
    //             <option className="sidebar-content-row-select-option" key={x} value={x}>
    //                 {x}
    //             </option>
    //         );
    //     });
    //     const select = (
    //         <select
    //             value={applicationSettingState.applicationSetting.mmvc_setting.voice_changer_mode}
    //             onChange={(e) => {
    //                 applicationSettingState.setVoiceChangerMode(e.target.value as VoiceChangerMode);
    //             }}
    //             className="sidebar-content-row-select-select"
    //         >
    //             {options}
    //         </select>
    //     );

    //     return (
    //         <div className="sidebar-content-row-3-7">
    //             <div className="sidebar-content-row-label">Mode:</div>
    //             <div className="sidebar-content-row-select">{select}</div>
    //         </div>
    //     )
    // }, [applicationSettingState.applicationSetting.mmvc_setting.voice_changer_mode]);

    const audioInputRow = useMemo(() => {
        return (
            <div className="sidebar-content-row-3-7">
                <div className="sidebar-content-row-label">Mic:</div>
                <div className="sidebar-content-row-select">
                    <DeviceSelector deviceType={"audioinput"}></DeviceSelector>
                </div>
            </div>
        );
    }, []);


    const speakerSelectRow = useMemo(() => {
        const srcOptions = applicationSettingState.applicationSetting.mmvc_setting.speakers.map((s) => {

            return (
                <option className="sidebar-content-row-select-option" key={s.id} value={s.id}>
                    {s.name}({s.id})
                </option>
            );
        });
        const srcSelect = (
            <select
                value={applicationSettingState.applicationSetting.mmvc_setting.src_id}
                onChange={(e) => {
                    applicationSettingState.setSrcSpeakerId(Number(e.target.value));
                }}
                className="sidebar-content-row-select-select"
            >
                {srcOptions}
            </select>
        );

        const dstOptions = applicationSettingState.applicationSetting.mmvc_setting.speakers.map((s) => {
            return (
                <option className="sidebar-content-row-select-option" key={s.id} value={s.id}>
                    {s.name}({s.id})
                </option>
            );
        });
        const dstSelect = (
            <select
                value={applicationSettingState.applicationSetting.mmvc_setting.dst_id}
                onChange={(e) => {
                    applicationSettingState.setDstSpeakerId(Number(e.target.value));
                }}
                className="sidebar-content-row-select-select"
            >
                {dstOptions}
            </select>
        );
        return (
            <>
                <div className="sidebar-content-row-3-7">
                    <div className="sidebar-content-row-label">Src Voice:</div>
                    <div className="sidebar-content-row-select">{srcSelect}</div>
                </div>


                <div className="sidebar-content-row-3-7">
                    <div className="sidebar-content-row-label">Dst Voice:</div>
                    <div className="sidebar-content-row-select">{dstSelect}</div>
                </div>
                <div className="sidebar-content-row-7-3">
                    <div className="sidebar-content-row-label stick-to-right">
                        edit voice mapping
                    </div>
                    <div className="sidebar-content-row-button" onClick={() => {
                        frontendManagerState.stateControls.speakerSettingDialogCheckbox.updateState(true)
                    }}>
                        edit
                    </div>
                </div>
            </>
        )

    }, [
        applicationSettingState.applicationSetting.mmvc_setting.src_id,
        applicationSettingState.applicationSetting.mmvc_setting.dst_id,
        applicationSettingState.applicationSetting.mmvc_setting.speakers])

    const gpuRow = useMemo(() => {
        const gpus = applicationSettingState.applicationSetting.mmvc_setting.available_gpus;
        const options = gpus.map((id) => {
            return (
                <option className="sidebar-content-row-select-option" key={id} value={id}>
                    {id}
                </option>
            );
        });
        const select = (
            <select
                value={applicationSettingState.applicationSetting.mmvc_setting.gpu}
                onChange={(e) => {
                    applicationSettingState.setGpu(Number(e.target.value));
                }}
                className="sidebar-content-row-select-select"
            >
                {options}
            </select>
        );


        return (
            <div className="sidebar-content-row-3-7">
                <div className="sidebar-content-row-label">GPU ID</div>
                <div className="sidebar-content-row-select">{select}</div>
            </div>
        );
    }, [applicationSettingState.applicationSetting.mmvc_setting.gpu]);


    // const prefixChunkRow = useMemo(() => {
    //     if (applicationSettingState.applicationSetting.mmvc_setting.voice_changer_mode !== "realtime") {
    //         return <></>;
    //     }

    //     const input = (
    //         <input
    //             type="number"
    //             value={applicationSettingState.applicationSetting.mmvc_setting.prefix_chunk_size}
    //             max={240}
    //             min={1}
    //             step={1}
    //             className="sidebar-content-row-input-input"
    //             onChange={(e) => {
    //                 let prefixChunkSize = Number(e.target.value);
    //                 if (prefixChunkSize < applicationSettingState.applicationSetting.mmvc_setting.chunk_size) {
    //                     // applicationSettingState.setChunkSize(prefixChunkSize); // プレフィックスはデルタサイズ以下にはできない。
    //                     e.target.value = String(applicationSettingState.applicationSetting.mmvc_setting.chunk_size);
    //                     return;
    //                 }
    //                 applicationSettingState.setPrefixChunkSize(prefixChunkSize);
    //             }}
    //         ></input>
    //     );

    //     return (
    //         <div className="sidebar-content-row-3-7">
    //             <div className="sidebar-content-row-label">Prev Size:</div>
    //             <div className="sidebar-content-row-input">{input}</div>
    //         </div>
    //     );
    // }, [applicationSettingState.applicationSetting.mmvc_setting.voice_changer_mode,
    // applicationSettingState.applicationSetting.mmvc_setting.prefix_chunk_size,
    // applicationSettingState.applicationSetting.mmvc_setting.chunk_size]);

    const chunkRow = useMemo(() => {
        if (applicationSettingState.applicationSetting.mmvc_setting.voice_changer_mode !== "realtime") {
            return <></>;
        }
        const input = (
            <input
                type="number"
                value={applicationSettingState.applicationSetting.mmvc_setting.chunk_size}
                max={240}
                min={1}
                step={1}
                className="sidebar-content-row-input-input"
                onChange={(e) => {
                    let chunkSize = Number(e.target.value);
                    // if (applicationSettingState.applicationSetting.mmvc_setting.prefix_chunk_size < chunkSize) {
                    //     // applicationSettingState.setPrefixChunkSize(chunkSize); // プレフィックスはデルタサイズ以下にはできない。
                    //     e.target.value = String(applicationSettingState.applicationSetting.mmvc_setting.prefix_chunk_size);
                    //     return;
                    // }
                    applicationSettingState.setChunkSize(chunkSize);
                    applicationSettingState.setPrefixChunkSize(chunkSize);
                }}
            ></input>

        )

        return (
            <>
                <div className="sidebar-content-row-3-7">
                    <div className="sidebar-content-row-label">Chunk Size:</div>
                    <div className="sidebar-content-row-input">{input}</div>
                </div>
                <div className="sidebar-content-row-1">
                    <div className="sidebar-content-row-label-small">(buffring about 20ms/1chunk)</div>
                </div>
            </>
        );
    }, [applicationSettingState.applicationSetting.mmvc_setting.chunk_size]);


    const realtimePlayButtonRow = useMemo(() => {
        if (applicationSettingState.applicationSetting.mmvc_setting.voice_changer_mode !== "realtime") {
            return <></>;
        }

        const label = voiceChangeEnabled ? "stop" : "start";
        const status = voiceChangeEnabled ? "converting..." : "stanby...";
        // const reciveDataStatus = voiceChangerControllerState.receivedDataStatus === "good" ? "" : "convert error"
        const className = voiceChangeEnabled ? "sidebar-content-row-button-activated" : "sidebar-content-row-button-stanby";
        const onClicked = voiceChangeEnabled
            ? () => {
                browserProxyState.stopVoiceChanger()
                setVoiceChangeEnabled(false)
            }
            : () => {
                browserProxyState.startVoiceChanger()
                setVoiceChangeEnabled(true)
            };

        return (
            <div className="sidebar-content-row-7-3 ">
                <div className="sidebar-content-row-label stick-to-right">
                    {status} {/*reciveDataStatus*/}
                </div>
                <div className={className} onClick={onClicked}>
                    {label}
                </div>
            </div>


        );
    }, [voiceChangeEnabled]);

    // const recordingButtonRow = useMemo(() => {
    //     if (applicationSettingState.applicationSetting?.voice_changer_mode !== "near-realtime") {
    //         return <></>;
    //     }

    //     const label = voiceChangerControllerState.isRecording ? "stop" : "start";
    //     const status = voiceChangerControllerState.isRecording ? "recording..." : "stanby...";
    //     const className = voiceChangerControllerState.isRecording ? "sidebar-content-row-button-activated" : "sidebar-content-row-button-stanby";
    //     const onClicked = voiceChangerControllerState.isRecording
    //         ? () => {
    //             voiceChangerControllerState.stopRecord();
    //             voiceChangerControllerState.sendRecordedData();
    //         }
    //         : () => {
    //             voiceChangerControllerState.startRecord();
    //         };

    //     return (
    //         <div className="sidebar-content-row-4-3-3">
    //             <div className="sidebar-content-row-label"></div>
    //             <div className="sidebar-content-row-label">
    //                 {status}
    //             </div>
    //             <div className={className} onClick={onClicked}>
    //                 {label}
    //             </div>
    //         </div>
    //     )
    // }, [applicationSettingState.applicationSetting.voice_changer_mode, voiceChangerControllerState.isRecording]);

    // const performanceRow = useMemo(() => {
    //     const row = (
    //         <>
    //             <div className="sidebar-content-row-5-5">
    //                 <div className="sidebar-content-row-label pad-left-3">Buffer Time:</div>
    //                 <div className="sidebar-content-row-label">{voiceChangerControllerState.bufferingTime} ms</div>
    //             </div>

    //             <div className="sidebar-content-row-5-5">
    //                 <div className="sidebar-content-row-label pad-left-3">Res Time:</div>
    //                 <div className="sidebar-content-row-label">{voiceChangerControllerState.responseTime} ms</div>
    //             </div>
    //         </>
    //     );
    //     return row;
    // }, [voiceChangerControllerState.responseTime, voiceChangerControllerState.bufferingTime]);


    //////////////////
    // Rendering   ///
    //////////////////
    return (
        <>
            <div className="sidebar-content">
                {modelInput}
                {audioInputRow}
                {speakerSelectRow}
                {gpuRow}
                {/* {prefixChunkRow} */}
                {chunkRow}
                {realtimePlayButtonRow}
            </div>
        </>
    );
};
