import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AppStateProvider } from "./003_provider/003_AppStateProvider";
import { AppSettingProvider, useAppSetting } from "./003_provider/001_AppSettingProvider";
import { AppRootStateProvider } from "./003_provider/002_AppRootStateProvider";
import { useMemo } from "react";

const AppStateProviderWrapper = () => {
    const { applicationSetting } = useAppSetting();
    if (!applicationSetting) {
        return <></>;
    } else {
        return (
            <AppStateProvider>
                <App />
            </AppStateProvider>
        );
    }
};




const NormalFrontPageDescription = () => {
    return (
        <>
            <div className="front-description">
                <p>
                    このアプリはリアルタイムボイスチェンジャー{" "}
                    <a href="https://github.com/isletennos/MMVC_Trainer" target="_blank">
                        MMVC
                    </a>
                    のZoom Clientです。
                </p>
                <p>
                    ソースコード、使用方法は
                    <a href="https://github.com/w-okada/voice-changer">こちら。</a>
                </p>
                <p className="front-description-strong">使ってみてコーヒーくらいならごちそうしてもいいかなという人はこちらからご支援お願いします。 </p>
                <p>
                    <a href="https://www.buymeacoffee.com/wokad">
                        <img className="front-description-img" src="./coffee.png"></img>
                    </a>
                </p>
                <a></a>
            </div>
        </>
    );
};

const AppRootStateProviderWrapper = () => {
    const { applicationSetting } = useAppSetting();
    const [firstTach, setFirstTouch] = React.useState<boolean>(false);

    // useEffect(() => {
    //     if (DEBUG) {
    //         setFirstTouch(true);
    //     }
    // }, [])

    const frontPageDescription = useMemo(() => {
        return <NormalFrontPageDescription></NormalFrontPageDescription>;
    }, []);

    const applicationTitle = useMemo(() => {
        return "Realtime Voice Changer for Zoom"
    }, [])

    const appStateProviderWrapper = useMemo(() => {
        return <AppStateProviderWrapper></AppStateProviderWrapper>
    }, [])

    const buttonColor = useMemo(() => {
        return "front-start-button-color"
    }, [])

    if (!applicationSetting || !firstTach) {
        return (
            <div className="front-container">
                <div className="front-title">{applicationTitle}</div>
                {frontPageDescription}
                <div
                    className={`front-start-button ${buttonColor}`}
                    onClick={() => {
                        const app = document.getElementById("app") as HTMLDivElement
                        app.style.height = "0%"
                        setFirstTouch(true);
                    }}
                >
                    Click to start
                </div>

                <div className="front-note">確認動作環境:Windows 11 + Chrome</div>
                <div className="front-disclaimer">免責：本ソフトウェアの使用または使用不能により生じたいかなる直接損害・間接損害・波及的損害・結果的損害 または特別損害についても、一切責任を負いません。</div>

            </div>
        );
    } else {
        return (
            <AppRootStateProvider>
                {appStateProviderWrapper}
            </AppRootStateProvider>
        );
    }
};


const container = document.getElementById("app")!;
const root = createRoot(container);
root.render(
    <AppSettingProvider>
        <AppRootStateProviderWrapper></AppRootStateProviderWrapper>
        {/* <AppStateProviderWrapper></AppStateProviderWrapper> */}
    </AppSettingProvider>
);
