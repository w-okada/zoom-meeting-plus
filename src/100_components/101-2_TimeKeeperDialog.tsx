import React, { useEffect } from "react";
import { useMemo } from "react";
import { TimeKeeperClientLangTypes } from "../002_hooks/120_useTimeKeeper";
import { useAppState } from "../003_provider/AppStateProvider";

export const TimeKeeperDialog = () => {
    const { timeKeeperState, frontendManagerState } = useAppState();

    const close = () => {
        frontendManagerState.stateControls.timeKeeperSettingDialogCheckbox.updateState(false);
    };
    ////////////////////////////
    //  Conponents
    ////////////////////////////
    const timePicker = useMemo(() => {
        return (
            <>
                <label htmlFor="time-keeper-end-time" className="time-keeper-end-time-label">
                    Set end time
                </label>
                <input id="time-keeper-end-time" type="time" name="appt-time" className="time-keeper-end-time"></input>
            </>
        );
    }, []);
    const triggers = useMemo(() => {
        return (
            <div className="dialog-input-controls">
                <div style={{ display: "flex", alignItems: "center" }}>
                    <input className="checkbox" type="checkbox" id="time-keeper-one-minute-trigger" />
                    <label htmlFor="time-keeper-one-minute-trigger" className="time-keeper-trigger-label">
                        one minute
                    </label>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <input className="checkbox" type="checkbox" id="time-keeper-three-minutes-trigger" />
                    <label htmlFor="time-keeper-three-minutes-trigger" className="time-keeper-trigger-label">
                        three minutes
                    </label>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <input className="checkbox" type="checkbox" id="time-keeper-five-minutes-trigger" />
                    <label htmlFor="time-keeper-five-minutes-trigger" className="time-keeper-trigger-label">
                        five minutes
                    </label>
                </div>
            </div>
        );
    }, []);

    const setLanguage = (ev: React.ChangeEvent<HTMLSelectElement>) => {
        timeKeeperState.setLang(ev.target.value as TimeKeeperClientLangTypes);
    };
    const langOptions = useMemo(() => {
        return (
            <div className="dialog-input-controls">
                <div style={{ display: "flex", alignItems: "center" }}>
                    <label htmlFor="time-keeper-language" className="time-keeper-language-label">
                        Language(voice):
                    </label>

                    <select
                        id="time-keeper-language"
                        className="time-keeper-language"
                        defaultValue={timeKeeperState.lang}
                        onChange={(ev) => {
                            setLanguage(ev);
                        }}
                    >
                        <option value="ja">ja</option>
                        <option value="en">en</option>
                    </select>
                </div>
            </div>
        );
    }, [timeKeeperState.lang]);

    const setTimeKeeper = useMemo(() => {
        return () => {
            const time = document.getElementById("time-keeper-end-time") as HTMLInputElement;
            const oneMinute = document.getElementById("time-keeper-one-minute-trigger") as HTMLInputElement;
            const threeMinutes = document.getElementById("time-keeper-three-minutes-trigger") as HTMLInputElement;
            const fiveMinutes = document.getElementById("time-keeper-five-minutes-trigger") as HTMLInputElement;
            timeKeeperState.setTimeKeeperProps({
                endTime: time.value,
                enable: true,
                oneMinuteEnable: oneMinute.checked,
                threeMinutesEnable: threeMinutes.checked,
                fiveMinutesEnable: fiveMinutes.checked,
            });
            frontendManagerState.stateControls.timeKeeperSettingDialogCheckbox.updateState(false);
        };
    }, []);
    useEffect(() => {
        const time = document.getElementById("time-keeper-end-time") as HTMLInputElement;
        const oneMinute = document.getElementById("time-keeper-one-minute-trigger") as HTMLInputElement;
        const threeMinutes = document.getElementById("time-keeper-three-minutes-trigger") as HTMLInputElement;
        const fiveMinutes = document.getElementById("time-keeper-five-minutes-trigger") as HTMLInputElement;
        time.value = timeKeeperState.endTime;
        oneMinute.checked = timeKeeperState.oneMinuteEnable;
        threeMinutes.checked = timeKeeperState.threeMinutesEnable;
        fiveMinutes.checked = timeKeeperState.fiveMinutesEnable;
    }, [timeKeeperState]);

    const buttons = useMemo(() => {
        return (
            <div className="dialog-input-controls">
                <div id="submit" className="submit-button" onClick={close}>
                    close
                </div>
                <div id="submit" className="submit-button" onClick={setTimeKeeper}>
                    ok
                </div>
            </div>
        );
    }, []);

    const form = useMemo(() => {
        return (
            <div className="dialog-frame">
                <div className="dialog-title">Setting</div>
                <div className="dialog-content">
                    <div className={"dialog-application-title"}></div>
                    <div className="dialog-description">Set Timekeeper</div>
                    <form>
                        <div className="dialog-input-container">
                            {timePicker}
                            {triggers}
                            {langOptions}
                            {buttons}
                        </div>
                    </form>
                </div>
            </div>
        );
    }, []);

    return form;
};
