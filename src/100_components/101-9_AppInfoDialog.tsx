import React from "react";
import { useMemo } from "react";
import { useAppState } from "../003_provider/AppStateProvider";
import { Credit, CreditProps } from "@dannadori/demo-base";

export const AppInfoDialog = () => {
    const { frontendManagerState } = useAppState();

    const close = () => {
        frontendManagerState.stateControls.appInfoDialogCheckbox.updateState(false);
    };
    const buttons = useMemo(() => {
        return (
            <div className="dialog-input-controls">
                <div id="submit" className="submit-button" onClick={close}>
                    close
                </div>
            </div>
        );
    }, []);

    const credits = useMemo(() => {
        return [
            [`燐酸様`, `VRM`, `https://hub.vroid.com/characters/3590580643081577083/models/4344551722337138718`],
            [`音読さん様`, `Voice is generated in 音読さん`, `https://ondoku3.com/ja/`],
            [`VOICEVOX様`, `Voice is generated with VOICEVOX(VOICEVOX:四国めたん, VOICEVOX:ずんだもん, VOICEVOX:春日部つむぎ, VOICEVOX:波音リツ, VOICEVOX:玄野武宏, VOICEVOX:白上虎太郎, VOICEVOX:青山龍星, VOICEVOX:冥鳴ひまり, VOICEVOX:九州そら)`, `https://voicevox.hiroshiba.jp/`],
        ].map((x) => {
            return (
                <div key={`${x[2]}`} className="app-info-dialog-record-container">
                    <div className="app-info-dialog-record-title">{x[0]}</div>
                    <div className="app-info-dialog-record-desc">{x[1]}</div>
                    <div className="app-info-dialog-record-url">
                        <a href={`${x[2]}`} rel="noreferrer" target="_blank">
                            HP
                        </a>
                    </div>
                </div>
            );
        });
    }, []);
    ////////////////////////////
    //  Conponents
    ////////////////////////////
    const form = useMemo(() => {
        const creditProps: CreditProps = {
            title: "Created by w-okada. FLECT, Co., Ltd.",
            homepage: "https://www.flect.co.jp/",
            github: "https://github.com/w-okada/image-analyze-workers",
            twitter: "https://twitter.com/DannadoriYellow",
            linkedin: "https://www.linkedin.com/in/068a68187/",
            blog: "https://medium.com/@dannadori",
        };
        return (
            <div className="dialog-frame">
                <div className="dialog-title">Setting</div>
                <div className="dialog-content">
                    <div className={"dialog-application-title"}>Information</div>
                    <div className="dialog-description"></div>
                    <Credit {...creditProps}></Credit>
                    <form>
                        <div className="dialog-input-container">
                            <div className="app-info-dialog-section">
                                <div className="app-info-dialog-section-title">Contributor</div>
                                <div className="app-info-dialog-record-container">
                                    <div className="app-info-dialog-record-title">wataru okada</div>
                                    <div className="app-info-dialog-record-url">
                                        <div className="app-info-dialog-record-url"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {credits}
                        <div className="dialog-input-container">
                            <div className="app-info-dialog-section">
                                <div className="app-info-dialog-section-title">Disclaimer</div>
                                <div className="app-info-dialog-disclaimer">In no event shall we be liable for any direct, indirect, consequential, or special damages arising out of the use or inability to use the software on this blog.</div>
                            </div>
                        </div>
                        <div className="dialog-input-container">{buttons}</div>
                    </form>
                </div>
            </div>
        );
    }, []);

    return form;
};
