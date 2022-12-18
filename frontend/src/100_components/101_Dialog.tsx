import React from "react";
import { useAppState } from "../003_provider/003_AppStateProvider";
import { EntranceDialog } from "./101-0_EntranceDialog";
import { SettingDialog } from "./101-1_SettingDialog";
import { AppInfoDialog } from "./101-9_AppInfoDialog";
import { SpeakerSettingDialog } from "./101-2_SpeakerSettingDialog";

export const Dialog = () => {
    const { frontendManagerState } = useAppState();

    return (
        <div>
            {frontendManagerState.stateControls.entranceDialogCheckbox.trigger}
            {frontendManagerState.stateControls.settingDialogCheckbox.trigger}
            {frontendManagerState.stateControls.appInfoDialogCheckbox.trigger}
            {frontendManagerState.stateControls.speakerSettingDialogCheckbox.trigger}

            <div className="dialog-container">
                {frontendManagerState.stateControls.entranceDialogCheckbox.trigger}
                <EntranceDialog />
                {frontendManagerState.stateControls.settingDialogCheckbox.trigger}
                <SettingDialog />
                {frontendManagerState.stateControls.speakerSettingDialogCheckbox.trigger}
                <SpeakerSettingDialog />
                {frontendManagerState.stateControls.appInfoDialogCheckbox.trigger}
                <AppInfoDialog />
            </div>
        </div>
    );
};
