import { StateControlCheckbox, useStateControlCheckbox } from "../100_components/hooks/useStateControlCheckbox";

export type UseFrontendManagerProps = {
    setStartTranscribe: (val: boolean) => void
}

export type StateControls = {
    openRightSidebarCheckbox: StateControlCheckbox
    startTranscribeCheckbox: StateControlCheckbox
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
    const openRightSidebarCheckbox = useStateControlCheckbox("open-right-sidebar-checkbox");

    const startTranscribeCheckbox = useStateControlCheckbox("start-transcribe-checkbox", (val: boolean) => { props.setStartTranscribe(val) });
    const settingDialogCheckbox = useStateControlCheckbox("setting-dialog-checkbox");

    const timeKeeperSettingDialogCheckbox = useStateControlCheckbox("time-keeper-setting-dialog-checkbox");
    const appInfoDialogCheckbox = useStateControlCheckbox("app-info-dialog-checkbox");

    const returnValue: FrontendManagerStateAndMethod = {
        stateControls: {
            openRightSidebarCheckbox,
            startTranscribeCheckbox,
            settingDialogCheckbox,
            timeKeeperSettingDialogCheckbox,
            appInfoDialogCheckbox,
        },
        dummy: ""

    };
    return returnValue;
};
