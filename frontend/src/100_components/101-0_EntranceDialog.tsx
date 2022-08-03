import React from "react";
import { useMemo } from "react";
import { useAppSetting } from "../003_provider/AppSettingProvider";
import { useAppState } from "../003_provider/AppStateProvider";

export const EntranceDialog = () => {
    const { frontendManagerState, backendManagerState, zoomSDKState, browserProxyState } = useAppState();
    const { applicationSetting } = useAppSetting();
    const defaultUsername = applicationSetting?.default_meeting.default_username || "";
    const defaultMeetingNumber = applicationSetting?.default_meeting.default_meeting_number || "";
    const defaultMeetingPassword = applicationSetting?.default_meeting.default_meeting_password || "";
    const defaultSecret = applicationSetting?.default_meeting.default_secret || "";
    const oauthSettting = applicationSetting?.oauth;

    ////////////////////////////
    //  Conponents
    ////////////////////////////
    const usernameInput = useMemo(() => {
        return (
            <div className="dialog-input-controls">
                <div className="dialog-input-description-label">user name</div>
                <input type="text" className="dialog-input-input-text" id="entrance-dialog-username" defaultValue={defaultUsername}></input>
            </div>
        );
    }, [defaultUsername]);
    const meetingNumberInput = useMemo(() => {
        return (
            <div className="dialog-input-controls">
                <div className="dialog-input-description-label">meeting number</div>
                <input type="text" className="dialog-input-input-text" id="entrance-dialog-meeting-number" defaultValue={defaultMeetingNumber}></input>
            </div>
        );
    }, [defaultMeetingNumber]);
    const passwordInput = useMemo(() => {
        return (
            <div className="dialog-input-controls">
                <div className="dialog-input-description-label">password</div>
                <input type="text" className="dialog-input-input-text" id="entrance-dialog-password" defaultValue={defaultMeetingPassword}></input>
            </div>
        );
    }, [defaultMeetingPassword]);
    const secretInput = useMemo(() => {
        return (
            <div className="dialog-input-controls">
                <div className="dialog-input-description-label">secret</div>
                <input type="text" className="dialog-input-input-text" id="entrance-dialog-secret" defaultValue={defaultSecret}></input>
            </div>
        );
    }, [defaultSecret]);

    const enterMeeting = useMemo(() => {
        return async () => {
            const usernameInput = document.getElementById("entrance-dialog-username") as HTMLInputElement;
            const meetingNumberInput = document.getElementById("entrance-dialog-meeting-number") as HTMLInputElement;
            const passwordInput = document.getElementById("entrance-dialog-password") as HTMLInputElement;
            // const secretInput = document.getElementById("entrance-dialog-secret") as HTMLInputElement;

            const username = usernameInput.value;
            const meetingNumber = meetingNumberInput.value;
            const password = passwordInput.value;
            const secret = 1000; //secretInput.value;

            const useLocalServer = applicationSetting?.sign_server.use_local_sign_server || false;
            const serverUrl = applicationSetting?.sign_server.sign_server_url || "";

            const role = 0; // join

            const signature = await backendManagerState.generateSignature(useLocalServer, serverUrl, {
                meetingNumber,
                role: String(role),
                secret: String(secret),
            });
            if (signature.signature === "wrong secret") {
                console.log("wrong secret!!!!!");
                return;
            }
            frontendManagerState.stateControls.entranceDialogCheckbox.updateState(false);
            try {
                await zoomSDKState.initZoomClient();
                await zoomSDKState.joinZoom(username, meetingNumber, password, signature.signature, signature.sdkKey);
            } catch (error: any) {
                console.log(error);
                frontendManagerState.stateControls.entranceDialogCheckbox.updateState(true);
            }
        };
    }, []);

    const buttons = useMemo(() => {
        return (
            <div className="dialog-input-submit-buttons-container">
                <div id="submit" className="dialog-input-submit-button" onClick={enterMeeting}>
                    enter
                </div>
            </div>
        );
    }, []);

    const oauth = useMemo(() => {
        const clientId = oauthSettting?.client_id || "";
        const redirectURL = oauthSettting?.redirect_url || "";
        if (clientId.length > 0 && redirectURL.length > 0) {
            const origin = `${location.protocol}//${location.host}/`;
            const oauthURL = `https://zoom.us/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectURL}&state=${origin}`;
            return <a href={oauthURL}>oauth</a>;
        } else {
            return <></>;
        }
    }, []);

    const form = useMemo(() => {
        return (
            <div className="dialog-frame">
                <div className="dialog-title">Enter Meeting</div>
                <div className="dialog-content">
                    <div className={"dialog-application-title"}></div>
                    <div className="dialog-description">Enter Meeting Information</div>
                    <form>
                        <div className="dialog-input-container">
                            {usernameInput}
                            {meetingNumberInput}
                            {passwordInput}
                            {secretInput}
                            {buttons}
                        </div>
                    </form>
                </div>
                {oauth}
            </div>
        );
    }, []);

    return form;
};
