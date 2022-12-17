import { StateControlCheckbox, useStateControlCheckbox } from "../100_components/hooks/useStateControlCheckbox";

export type UseFrontendManagerProps = {
    // setStartTranscribe: (val: boolean) => void
}

export type StateControls = {
    openRightSidebarCheckbox: StateControlCheckbox
    entranceDialogCheckbox: StateControlCheckbox
    settingDialogCheckbox: StateControlCheckbox
    timeKeeperSettingDialogCheckbox: StateControlCheckbox
    appInfoDialogCheckbox: StateControlCheckbox


}

type FrontendManagerState = {
    stateControls: StateControls
};

export type FrontendManagerStateAndMethod = FrontendManagerState & {
    dummy: string
}
export const useFrontendManager = (props: UseFrontendManagerProps): FrontendManagerStateAndMethod => {
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

    const timeKeeperSettingDialogCheckbox = useStateControlCheckbox("time-keeper-setting-dialog-checkbox");
    const appInfoDialogCheckbox = useStateControlCheckbox("app-info-dialog-checkbox");


    const returnValue: FrontendManagerStateAndMethod = {
        stateControls: {
            // (1) Controller Switch
            openRightSidebarCheckbox,
            // (2) Dialog
            entranceDialogCheckbox,
            settingDialogCheckbox,
            timeKeeperSettingDialogCheckbox,
            appInfoDialogCheckbox,
        },
        dummy: ""

    };
    return returnValue;
};
