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
            <div className="dialog-input-controls">
                <div className="dialog-input-description-label">End Time</div>
                <input id="time-keeper-end-time" type="time" name="appt-time" className="dialog-input-time"></input>
            </div>
        );
    }, []);
    const triggers = useMemo(() => {
        return (
            <>
                <div className="dialog-input-controls">
                    <div className="dialog-input-description-label right">notify before 1min</div>
                    <input id="time-keeper-one-minute-trigger" className="dialog-input-toggle" type="checkbox" />
                    <label htmlFor="time-keeper-one-minute-trigger" className="dialog-input-toggle-label" />
                </div>

                <div className="dialog-input-controls">
                    <div className="dialog-input-description-label right">3min</div>
                    <input id="time-keeper-three-minutes-trigger" className="dialog-input-toggle" type="checkbox" />
                    <label htmlFor="time-keeper-three-minutes-trigger" className="dialog-input-toggle-label" />
                </div>

                <div className="dialog-input-controls">
                    <div className="dialog-input-description-label  right">5min</div>
                    <input id="time-keeper-five-minutes-trigger" className="dialog-input-toggle" type="checkbox" />
                    <label htmlFor="time-keeper-five-minutes-trigger" className="dialog-input-toggle-label" />
                </div>
            </>
        );
    }, []);

    const setLanguage = (ev: React.ChangeEvent<HTMLSelectElement>) => {
        timeKeeperState.setLang(ev.target.value as TimeKeeperClientLangTypes);
    };
    const langOptions = useMemo(() => {
        return (
            <div className="dialog-input-controls">
                <div className="dialog-input-description-label right">Language(voice):</div>

                <select
                    id="time-keeper-language"
                    className="dialog-input-select"
                    defaultValue={timeKeeperState.lang}
                    onChange={(ev) => {
                        setLanguage(ev);
                    }}
                >
                    <option value="ja">ja</option>
                    <option value="en">en</option>
                </select>
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
            <div className="dialog-input-submit-buttons-container">
                <div id="submit" className="dialog-input-cancel-button" onClick={close}>
                    close
                </div>
                <div id="submit" className="dialog-input-submit-button" onClick={setTimeKeeper}>
                    ok
                </div>
            </div>
        );
    }, []);

    const form = useMemo(() => {
        return (
            <div className="dialog-frame">
                <div className="dialog-title">TimeKeeper Setting</div>
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
