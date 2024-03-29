import { useEffect } from "react";
import { StateControlCheckbox, useStateControlCheckbox } from "../100_components/hooks/useStateControlCheckbox";


export type StateControls = {
    openRightSidebarCheckbox: StateControlCheckbox
    entranceDialogCheckbox: StateControlCheckbox
    settingDialogCheckbox: StateControlCheckbox
    appInfoDialogCheckbox: StateControlCheckbox
    speakerSettingDialogCheckbox: StateControlCheckbox
}

type FrontendManagerState = {
    stateControls: StateControls
};

export type FrontendManagerStateAndMethod = FrontendManagerState & {
    dummy: string
}
export const useFrontendManager = (): FrontendManagerStateAndMethod => {
    // (1) Controller Switch
    const openRightSidebarCheckbox = useStateControlCheckbox("open-right-sidebar-checkbox", (val: boolean) => {
        const inner = document.getElementById("inner-index-container")
        if (inner) {
            if (val) {
                inner.style.paddingRight = `320px`
            } else {
                inner.style.paddingRight = `0px`
            }
        }
    });

    // (2) Dialog
    const entranceDialogCheckbox = useStateControlCheckbox("entrance-dialog-checkbox");

    const settingDialogCheckbox = useStateControlCheckbox("setting-dialog-checkbox");

    const appInfoDialogCheckbox = useStateControlCheckbox("app-info-dialog-checkbox");

    const speakerSettingDialogCheckbox = useStateControlCheckbox("speaker-setting-dialog-checkbox");

    useEffect(() => {
        speakerSettingDialogCheckbox.updateState(false)
    }, [])


    const returnValue: FrontendManagerStateAndMethod = {
        stateControls: {
            // (1) Controller Switch
            openRightSidebarCheckbox,
            // (2) Dialog
            entranceDialogCheckbox,
            settingDialogCheckbox,
            appInfoDialogCheckbox,
            speakerSettingDialogCheckbox,
        },
        dummy: ""

    };
    return returnValue;
};
