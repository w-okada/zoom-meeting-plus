import React from "react";
import { useAppState } from "../003_provider/AppStateProvider";
import { EntranceDialog } from "./101-0_EntranceDialog";
import { SettingDialog } from "./101-1_SettingDialog";
import { TimeKeeperDialog } from "./101-2_TimeKeeperDialog";
import { AppInfoDialog } from "./101-9_AppInfoDialog";

export const Dialog = () => {
    const { frontendManagerState } = useAppState();

    return (
        <div>
            {frontendManagerState.stateControls.entranceDialogCheckbox.trigger}
            {frontendManagerState.stateControls.settingDialogCheckbox.trigger}
            {frontendManagerState.stateControls.timeKeeperSettingDialogCheckbox.trigger}
            {frontendManagerState.stateControls.appInfoDialogCheckbox.trigger}

            <div className="dialog-container">
                {frontendManagerState.stateControls.entranceDialogCheckbox.trigger}
                <EntranceDialog />

                {frontendManagerState.stateControls.settingDialogCheckbox.trigger}
                <SettingDialog />
                {frontendManagerState.stateControls.timeKeeperSettingDialogCheckbox.trigger}
                <TimeKeeperDialog />
                {frontendManagerState.stateControls.appInfoDialogCheckbox.trigger}
                <AppInfoDialog />
            </div>
        </div>
    );
};
