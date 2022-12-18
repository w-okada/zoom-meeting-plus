import { uploadModelProps, ModelProps } from "@dannadori/mmvc-client-js";
import React, { useEffect, useMemo, useState } from "react";
import { useAppSetting } from "../003_provider/001_AppSettingProvider";
import { useAppState } from "../003_provider/003_AppStateProvider";
import { DeviceSelector } from "./parts/101_DeviceSelector";


export const MMVCSetting = () => {
    const { applicationSettingState, deviceManagerState } = useAppSetting()
    const { frontendManagerState, browserProxyState } = useAppState()
    const [modelProps, setModelProps] = useState<ModelProps>({
        modelFile: null,
        configFile: null
    })
    const [modelUploadProgress, setModelUploadProgress] = useState<number>(100)
    const [modelUploadEnd, setModelUploadEnd] = useState<boolean>(true)
    const [voiceChangeEnabled, setVoiceChangeEnabled] = useState<boolean>(false)

    const serverUrlRow = useMemo(() => {
        const cliecked = () => {
            const textInput = document.getElementById("sidebar-mmvc-server-url-text") as HTMLInputElement
            applicationSettingState.setVoiceChangerServerUrl(textInput.value)
        }
        return (
            <div className="sidebar-content-row-3-5-2">
                <div className="sidebar-content-row-label">MMVC url</div>
                <div className="sidebar-content-row-input">
                    <input type="text" className="sidebar-content-row-input-input" id="sidebar-mmvc-server-url-text" defaultValue={applicationSettingState.applicationSetting.mmvc_setting.voice_changer_server_url} />
                </div>
                <div className="sidebar-content-row-label">
                    <div
                        className="sidebar-content-row-button"
                        onClick={cliecked}
                    >
                        set
                    </div>

                </div>
            </div>
        )
    }, [])
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
        const status = voiceChangeEnabled ? browserProxyState.mmvcState.length == 0 ? "converting..." : `${browserProxyState.mmvcState}` : "stanby...";
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
    }, [voiceChangeEnabled, browserProxyState.mmvcState]);

    const performanceRow = (
        <div className="sidebar-content-row-2-2-2-2-2 ">
            <div className="sidebar-content-row-label">
            </div>
            <div className="sidebar-content-row-label">
                buf:
            </div>
            <div className="sidebar-content-row-label">
                {browserProxyState.mmvcSendBufferingTime}
            </div>
            <div className="sidebar-content-row-label">
                res:
            </div>
            <div className="sidebar-content-row-label">
                {browserProxyState.mmvcResponseTime}
            </div>
        </div>
    )


    useEffect(() => {
        setVoiceChangeEnabled(false)
    }, [deviceManagerState.audioInputDeviceId])

    //////////////////
    // Rendering   ///
    //////////////////
    return (
        <>
            <div className="sidebar-content">
                {serverUrlRow}
                {modelInput}
                {audioInputRow}
                {speakerSelectRow}
                {gpuRow}
                {chunkRow}
                {realtimePlayButtonRow}
                {performanceRow}
            </div>
        </>
    );
};
