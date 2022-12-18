import React, { useEffect, useState } from "react";
import { useAppSetting } from "../003_provider/001_AppSettingProvider";
import { useAppState } from "../003_provider/003_AppStateProvider";

export type SpeakerSettingDialogProps = {};

export const SpeakerSettingDialog = (_props: SpeakerSettingDialogProps) => {
    const { applicationSettingState } = useAppSetting()
    const { frontendManagerState } = useAppState();
    const [sid, setSid] = useState<number>(100)

    useEffect(() => {
        const name = document.getElementById("dialog-voice-setting-name") as HTMLInputElement
        const existSpeaker = applicationSettingState.applicationSetting.mmvc_setting.speakers.find(x => {
            return x.id === sid
        })
        if (existSpeaker) {
            name.value = existSpeaker.name
        } else {
            name.value = ""
        }
    }, [sid])

    const updateMapping = () => {
        const sid = document.getElementById("dialog-voice-setting-id") as HTMLInputElement
        const name = document.getElementById("dialog-voice-setting-name") as HTMLInputElement


        const existSpeaker = applicationSettingState.applicationSetting.mmvc_setting.speakers.filter(x => {
            return x.id !== Number(sid.value)
        })

        if (name.value.length != 0) {
            existSpeaker.push({
                id: Number(sid.value),
                name: name.value
            })
        }
        applicationSettingState.updateSpeakerMapping(existSpeaker)
    }

    return (
        <div className="dialog-frame">
            <div className="dialog-title">Voice Setting</div>
            <div className="dialog-content">

                <div className="dialog-content-row-spacer"></div>

                <div className="dialog-content-row-1">
                    <div className="dialog-content-row-label">Voice Id - Name mapping</div>
                </div>

                <div className="dialog-content-row-spacer"></div>

                <div className="dialog-content-row-4-4-2">
                    <div className="dialog-content-row-label">ID</div>
                    <div className="dialog-content-row-label">Name</div>
                    <div className="dialog-content-row-label"></div>
                </div>
                <div className="dialog-content-row-4-4-2">
                    <div className="dialog-content-row-input">
                        <input type="number"
                            max={200}
                            min={1}
                            step={1}
                            value={sid}
                            className="dialog-content-row-input-input"
                            onChange={(e) => {
                                setSid(Number(e.target.value))
                            }}
                            id="dialog-voice-setting-id"
                        />
                    </div>
                    <div className="dialog-content-row-input">
                        <input className="dialog-content-row-input-input" id="dialog-voice-setting-name" />
                    </div>
                    <div className="dialog-content-row-button" onClick={() => {
                        updateMapping()
                    }}>update</div>
                </div>

                <div className="dialog-content-row-spacer"></div>
                <div className="dialog-content-row-dividing"></div>
                <div className="dialog-content-row-2-2-2-2-2">
                    <div className="dialog-content-row-label"></div>
                    {/* <div className="dialog-content-row-button" onClick={() => {
                        alert("not implemented")
                    }}>export(N/A)</div> */}
                    {/* <div className="dialog-content-row-button" onClick={() => {
                        alert("not implemented")
                    }}>import(N/A)</div> */}
                    <div className="dialog-content-row-button" onClick={() => {
                        frontendManagerState.stateControls.speakerSettingDialogCheckbox.updateState(false)
                    }}>close</div>
                    <div className="dialog-content-row-label"></div>
                </div>

                <div className="dialog-content-row-spacer"></div>
                <div className="dialog-content-row-spacer"></div>

            </div>
        </div>

    )
};
