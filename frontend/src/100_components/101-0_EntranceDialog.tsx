import React from "react";
import { useMemo } from "react";
import { useAppSetting } from "../003_provider/001_AppSettingProvider";
import { useAppState } from "../003_provider/003_AppStateProvider";
import { KJUR } from "jsrsasign"

export const EntranceDialog = () => {
    const { frontendManagerState, zoomSDKState } = useAppState();
    const { applicationSettingState } = useAppSetting();
    const defaultUsername = applicationSettingState.applicationSetting.default_meeting.default_username || "";
    const defaultMeetingNumber = applicationSettingState.applicationSetting.default_meeting.default_meeting_number || "";
    const defaultMeetingPassword = applicationSettingState.applicationSetting.default_meeting.default_meeting_password || "";
    const defaultSecret = applicationSettingState.applicationSetting.default_meeting.default_secret || "";
    const oauthSettting = applicationSettingState.applicationSetting.oauth;


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
    // const secretInput = useMemo(() => {
    //     return (
    //         <div className="dialog-input-controls">
    //             <div className="dialog-input-description-label">secret</div>
    //             <input type="text" className="dialog-input-input-text" id="entrance-dialog-secret" defaultValue={defaultSecret}></input>
    //         </div>
    //     );
    // }, [defaultSecret]);

    const sdkKeyInput = useMemo(() => {
        return (
            <div className="dialog-input-controls">
                <div className="dialog-input-description-label">sdk key</div>
                <input type="text" className="dialog-input-input-text" id="entrance-dialog-sdk-key" defaultValue={defaultSecret}></input>
            </div>
        );
    }, [defaultSecret]);
    const sdkSecretInput = useMemo(() => {
        return (
            <div className="dialog-input-controls">
                <div className="dialog-input-description-label">sdk secret</div>
                <input type="text" className="dialog-input-input-text" id="entrance-dialog-sdk-secret" defaultValue={defaultSecret}></input>
            </div>
        );
    }, [defaultSecret]);

    const enterMeeting = useMemo(() => {
        const generateKey = (meetingNumber: string, role: number, sdk_key: string, sdk_secret: string) => {
            const iat = Math.round(new Date().getTime() / 1000) - 30;
            const exp = iat + 60 * 60 * 2;
            const oHeader = { alg: "HS256", typ: "JWT" };
            const oPayload = {
                sdkKey: sdk_key,
                mn: meetingNumber,
                role: role,
                iat: iat,
                exp: exp,
                appKey: sdk_key,
                tokenExp: iat + 60 * 60 * 2,
            };

            const sHeader = JSON.stringify(oHeader);
            const sPayload = JSON.stringify(oPayload);
            const signature = KJUR.jws.JWS.sign("HS256", sHeader, sPayload, sdk_secret);
            return signature
        }


        return async () => {
            const usernameInput = document.getElementById("entrance-dialog-username") as HTMLInputElement;
            const meetingNumberInput = document.getElementById("entrance-dialog-meeting-number") as HTMLInputElement;
            const passwordInput = document.getElementById("entrance-dialog-password") as HTMLInputElement;
            // const secretInput = document.getElementById("entrance-dialog-secret") as HTMLInputElement;
            const sdkKeyInput = document.getElementById("entrance-dialog-sdk-key") as HTMLInputElement;
            const sdkSecretInput = document.getElementById("entrance-dialog-sdk-secret") as HTMLInputElement;

            const username = usernameInput.value;
            const meetingNumber = meetingNumberInput.value;
            const password = passwordInput.value;
            // const secret = 1000; //secretInput.value;
            const sdkKey = sdkKeyInput.value
            const sdkSecret = sdkSecretInput.value

            // const useLocalServer = applicationSettingState.applicationSetting.sign_server.use_local_sign_server || false;
            // const serverUrl = applicationSettingState.applicationSetting.sign_server.sign_server_url || "";

            const role = 0; // join




            // const signature = await backendManagerState.generateSignature(useLocalServer, serverUrl, {
            //     meetingNumber,
            //     role: String(role),
            //     secret: String(secret),
            // });
            // if (signature.signature === "wrong secret") {
            //     console.log("wrong secret!!!!!");
            //     return;
            // }
            const signature = generateKey(meetingNumber, role, sdkKey, sdkSecret)

            frontendManagerState.stateControls.entranceDialogCheckbox.updateState(false);
            try {
                await zoomSDKState.initZoomClient();
                // await zoomSDKState.joinZoom(username, meetingNumber, password, signature.signature, signature.sdkKey, applicationSettingState.zak);
                await zoomSDKState.joinZoom(username, meetingNumber, password, signature, sdkKey, applicationSettingState.zak);
            } catch (error: any) {
                console.log("JOIN ZOOM EXCEPTION!")
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
                            {/* {secretInput} */}
                            {sdkKeyInput}
                            {sdkSecretInput}
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
