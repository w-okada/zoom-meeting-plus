import React from "react";
import { useMemo } from "react";
import { useAppState } from "../003_provider/AppStateProvider";
import { Credit, CreditProps } from "./parts/003_Credit";

export const AppInfoDialog = () => {
    const { frontendManagerState } = useAppState();

    const close = () => {
        frontendManagerState.stateControls.appInfoDialogCheckbox.updateState(false);
    };
    const buttons = useMemo(() => {
        return (
            <div className="dialog-input-submit-buttons-container">
                <div id="submit" className="dialog-input-submit-button" onClick={close}>
                    close
                </div>
            </div>
        );
    }, []);

    const creditProps: CreditProps = {
        title: "Created by w-okada. FLECT, Co., Ltd.",
        homepage: "https://www.flect.co.jp/",
        github: "https://github.com/w-okada/image-analyze-workers",
        twitter: "https://twitter.com/DannadoriYellow",
        linkedin: "https://www.linkedin.com/in/068a68187/",
        blog: "https://medium.com/@dannadori",
    };
    const credit = <Credit {...creditProps}></Credit>;
    ////////////////////////////
    //  Conponents
    ////////////////////////////
    const form = useMemo(() => {
        return (
            <div className="dialog-frame">
                <div className="dialog-title">Application Information</div>
                <div className="dialog-content">
                    <div className={"dialog-application-title"}></div>
                    <div className="dialog-description"></div>
                    <div className="dialog-application-information-container">
                        <div className="dialog-application-information-title">Description</div>
                        <div className="dialog-application-information-text">{credit}</div>
                        <div className="dialog-application-information-title">Cotributors</div>
                        <div className="dialog-application-information-list-container">
                            <div className="dialog-application-information-list">
                                <div className="dialog-application-information-list-name">wok</div>
                                <div className="dialog-application-information-list-description">main contributor</div>
                                <div className="dialog-application-information-list-url">
                                    <a href="https://medium.com/@dannadori" rel="noreferrer" target="_blank">
                                        HP
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="dialog-application-information-title">Acknowledgments</div>
                        <div className="dialog-application-information-list-container">
                            <div className="dialog-application-information-list">
                                <div className="dialog-application-information-list-name">燐酸様</div>
                                <div className="dialog-application-information-list-description">VRM</div>
                                <div className="dialog-application-information-list-url">
                                    <a href="https://hub.vroid.com/characters/3590580643081577083/models/4344551722337138718" rel="noreferrer" target="_blank">
                                        HP
                                    </a>
                                </div>
                            </div>
                            <div className="dialog-application-information-list">
                                <div className="dialog-application-information-list-name">音読さん様</div>
                                <div className="dialog-application-information-list-description">Voice is generated in 音読さん</div>
                                <div className="dialog-application-information-list-url">
                                    <a href="https://ondoku3.com/ja/" rel="noreferrer" target="_blank">
                                        HP
                                    </a>
                                </div>
                            </div>
                            <div className="dialog-application-information-list">
                                <div className="dialog-application-information-list-name">VOICEVOX様</div>
                                <div className="dialog-application-information-list-description">
                                    <p>Voice is generated with VOICEVOX</p>
                                    <span className="dialog-application-information-list-voice-vox-list">VOICEVOX:四国めたん</span>
                                    <span className="dialog-application-information-list-voice-vox-list">VOICEVOX:ずんだもん</span>
                                    <span className="dialog-application-information-list-voice-vox-list">VOICEVOX:春日部つむぎ</span>
                                    <span className="dialog-application-information-list-voice-vox-list">VOICEVOX:波音リツ</span>
                                    <span className="dialog-application-information-list-voice-vox-list">VOICEVOX:玄野武宏</span>
                                    <span className="dialog-application-information-list-voice-vox-list">VOICEVOX:白上虎太郎</span>
                                    <span className="dialog-application-information-list-voice-vox-list">VOICEVOX:青山龍星</span>
                                    <span className="dialog-application-information-list-voice-vox-list">VOICEVOX:冥鳴ひまり</span>
                                    <span className="dialog-application-information-list-voice-vox-list">VOICEVOX:九州そら</span>
                                </div>
                                <div className="dialog-application-information-list-url">
                                    <a href="https://voicevox.hiroshiba.jp/" rel="noreferrer" target="_blank">
                                        HP
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="dialog-application-information-title">Disclaimer</div>
                        <div className="dialog-application-information-text">In no event shall we be liable for any direct, indirect, consequential, or special damages arising out of the use or inability to use this software.</div>
                    </div>
                    <div className="dialog-input-container">{buttons}</div>
                </div>
            </div>
        );
    }, [credit]);

    return <>{form}</>;
};
