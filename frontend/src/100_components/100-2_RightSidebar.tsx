import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAppState } from "../003_provider/003_AppStateProvider";
import { useStateControlCheckbox } from "./hooks/useStateControlCheckbox";
import { AnimationTypes, HeaderButton, HeaderButtonProps } from "./parts/002_HeaderButton";
import { useAppSetting } from "../003_provider/001_AppSettingProvider";
import { SpeachRecognitionLanguagesKeys, useSpeachRecognition } from "./hooks/useSpeachRecognition";
import { SpeachRecognitionLanguages } from "./hooks/SpeachRecognitherLanguages";
import { Header } from "./100-1_Header";

import { generateConfig, OperationParams, WorkerManager } from "@dannadori/psdanimator";
import { AnimationInfo } from "./100-2_RightSidebarAnimation";


export const RightSidebar = () => {
    const { frontendManagerState, browserProxyState, resourceManagerState } = useAppState();
    const { applicationSetting } = useAppSetting();
    const voiceSetting = applicationSetting!.voicevox_setting;
    const [voice, setVoice] = useState<Blob | null>(null);
    const { languageKey, recognitionStartSync, setLanguageKey } = useSpeachRecognition();
    const isRecognitionEnabledRef = useRef<boolean>(false);
    const [isRecognitionEnableSync, setIsRecognitionEnableSync] = useState<boolean>(false);
    const [echoBack, setEchoback] = useState<boolean>(true);

    const sidebarAccordionAvatarCheckbox = useStateControlCheckbox("sidebar-accordion-avatar-checkbox");
    const sidebarAccordionAvatarVideoCheckbox = useStateControlCheckbox("sidebar-accordion-avatar-video-checkbox");

    const psdAnimator = useMemo(() => {
        return new WorkerManager()
    }, [])


    useEffect(() => {
        const load = async () => {
            const canvasElement = document.getElementById("test-canvas") as HTMLCanvasElement;
            const psdFile = await resourceManagerState.fetchPSD("zundamonB.psd")
            const config = generateConfig(psdFile, canvasElement, 1024, 960, true)
            // const config = generateConfig(psdFile, canvasElement, 640, 480, false)
            await psdAnimator.init(config)
            const p1: OperationParams = {
                type: "SET_MOTION",
                motion: AnimationInfo
            }
            await psdAnimator.execute(p1)
            console.log("set motion")
            const p2: OperationParams = {
                type: "SWITCH_MOTION_MODE",
                // motionMode: "talking",
                motionMode: "normal",
            }
            await psdAnimator.execute(p2)
            console.log("set motion mode")

            const p3: OperationParams = {
                type: "START",
            }
            await psdAnimator.execute(p3)
            console.log("start motion")


            const p4: OperationParams = {
                type: "SET_WAIT_RATE",
                waitRate: 1
            }
            await psdAnimator.execute(p4)
            console.log("start wait rate")
        }
        load()

    }, [])

    /**
     * (1)According Actions
     */
    //// (1-1) accordion button for avatar
    const accodionButtonForAvatar = useMemo(() => {
        const accodionButtonForAvatarProps: HeaderButtonProps = {
            stateControlCheckbox: sidebarAccordionAvatarCheckbox,
            tooltip: "Open/Close",
            onIcon: ["fas", "caret-up"],
            offIcon: ["fas", "caret-up"],
            animation: AnimationTypes.spinner,
            tooltipClass: "tooltip-right",
        };
        return <HeaderButton {...accodionButtonForAvatarProps}></HeaderButton>;
    }, []);
    //// (1-2) accordion button for video
    const accodionButtonForAvatarVideo = useMemo(() => {
        const accodionButtonForAvatarVideoProps: HeaderButtonProps = {
            stateControlCheckbox: sidebarAccordionAvatarVideoCheckbox,
            tooltip: "Open/Close",
            onIcon: ["fas", "caret-up"],
            offIcon: ["fas", "caret-up"],
            animation: AnimationTypes.spinner,
            tooltipClass: "tooltip-right",
        };
        return <HeaderButton {...accodionButtonForAvatarVideoProps}></HeaderButton>;
    }, []);

    /**
     * (2)According Initial State
     */
    useEffect(() => {
        sidebarAccordionAvatarCheckbox.updateState(true);
        sidebarAccordionAvatarVideoCheckbox.updateState(true);
    }, []);

    /**
     * (3) User Operation
     */
    //// (3-1) Speak
    const speakClicked = async () => {
        const text = document.getElementById("sidebar-avatar-area-voice-text") as HTMLInputElement;
        const lang = document.getElementById("sidebar-lang-selector") as HTMLInputElement;
        const speaker = document.getElementById("sidebar-speaker-selector") as HTMLInputElement;
        console.log(text.value, lang.value, speaker.value);

        if (resourceManagerState.speakersInVoiceVox[speaker.value]) {
            const speakerId = resourceManagerState.speakersInVoiceVox[speaker.value];
            const voice = await resourceManagerState.generateVoiceWithVoiceVox(speakerId, text.value);
            setVoice(voice);
        } else if (resourceManagerState.speakersInOpenTTS[lang.value]) {
            const voice = await resourceManagerState.generateVoiceWithOpenTTS(lang.value, speaker.value, text.value);
            setVoice(voice);
        }
    };

    useEffect(() => {
        if (!voice) {
            return;
        }
        const play = async () => {
            browserProxyState.playAudio(await voice.arrayBuffer());
            if (echoBack) {
                const echobackAudio = document.getElementById("sidebar-generate-voice-player") as HTMLAudioElement;
                echobackAudio.src = URL.createObjectURL(voice);
                echobackAudio.play();
            }
            setVoice(null);
        };
        play();
    }, [voice, echoBack]);

    ////// (3-1-1) Speaker Setting
    const [localLangSpeakerMap, setLocalLangSpeakerMap] = useState<{ [lang: string]: string[] }>({});
    const [selectedLang, setSelectedLang] = useState<string>(voiceSetting.voice_lang);
    const [selectedSpeaker, setSelectedSpeaker] = useState<string>(voiceSetting.voice_speaker);
    useEffect(() => {
        const langSpeakerMap = { ...resourceManagerState.speakersInOpenTTS };
        if (!langSpeakerMap["ja"]) {
            langSpeakerMap["ja"] = [];
        }
        langSpeakerMap["ja"] = [...langSpeakerMap["ja"], ...Object.keys(resourceManagerState.speakersInVoiceVox)];
        setLocalLangSpeakerMap({ ...langSpeakerMap });
    }, [resourceManagerState.speakersInOpenTTS, resourceManagerState.speakersInVoiceVox]);
    const langSelector = useMemo(() => {
        const keys = Object.keys(localLangSpeakerMap).sort((a, b) => {
            return a < b ? -1 : 1;
        });
        const selector = (
            <select
                id="sidebar-lang-selector"
                className="sidebar-zoom-area-lang-selector"
                onChange={(ev) => {
                    setSelectedLang(ev.target.value);
                }}
                value={selectedLang}
            >
                {keys.map((x) => {
                    return (
                        <option key={x} value={x}>
                            {x}
                        </option>
                    );
                })}
            </select>
        );
        return selector;
    }, [localLangSpeakerMap, selectedLang]);
    const speakerSelector = useMemo(() => {
        if (!localLangSpeakerMap[selectedLang]) {
            return <></>;
        }
        const selector = (
            <select
                id="sidebar-speaker-selector"
                className="sidebar-zoom-area-speaker-selector"
                onChange={(ev) => {
                    setSelectedSpeaker(ev.target.value);
                }}
                value={selectedSpeaker}
            >
                {localLangSpeakerMap[selectedLang].map((x) => {
                    return (
                        <option key={x} value={x}>
                            {x}
                        </option>
                    );
                })}
            </select>
        );
        return selector;
    }, [localLangSpeakerMap, selectedLang, selectedSpeaker]);



    //// (3-3)
    const speachRecognitonLanguagesSelector = useMemo(() => {
        const selector = (
            <select
                id="sidebar-lang-selector"
                className="sidebar-zoom-area-lang-selector"
                onChange={(ev) => {
                    setLanguageKey(ev.target.value as SpeachRecognitionLanguagesKeys);
                }}
                value={languageKey}
            >
                {Object.keys(SpeachRecognitionLanguages).map((x) => {
                    return (
                        <option key={x} value={x}>
                            {x}
                        </option>
                    );
                })}
            </select>
        );
        return selector;
    }, [languageKey]);

    const recognitionClicked = async () => {
        isRecognitionEnabledRef.current = !isRecognitionEnabledRef.current;
        console.log("recognitionClicked", isRecognitionEnabledRef.current);

        if (isRecognitionEnabledRef.current) {
            setIsRecognitionEnableSync(true);
            const recognition = async () => {
                const message = await recognitionStartSync();
                console.log("MESSAGE:", message);
                const generateVoice = async () => {
                    const lang = document.getElementById("sidebar-lang-selector") as HTMLInputElement;
                    const speaker = document.getElementById("sidebar-speaker-selector") as HTMLInputElement;
                    if (resourceManagerState.speakersInVoiceVox[speaker.value]) {
                        const speakerId = resourceManagerState.speakersInVoiceVox[speaker.value];
                        const voice = await resourceManagerState.generateVoiceWithVoiceVox(speakerId, message);
                        setVoice(voice);
                    } else if (resourceManagerState.speakersInOpenTTS[lang.value]) {
                        const voice = await resourceManagerState.generateVoiceWithOpenTTS(lang.value, speaker.value, message);
                        setVoice(voice);
                    }
                };
                if (message.length > 0) {
                    generateVoice();
                }
                if (isRecognitionEnabledRef.current) {
                    recognition();
                } else {
                    setIsRecognitionEnableSync(false);
                }
            };
            recognition();
        }
    };


    const motionButtons = useMemo(() => {
        return <></>
    }, []);

    //////////////////
    // Rendering   ///
    //////////////////
    return (
        <>
            {frontendManagerState.stateControls.openRightSidebarCheckbox.trigger}
            <div className="right-sidebar">
                <Header></Header>
                {sidebarAccordionAvatarCheckbox.trigger}
                <div className="sidebar-partition">
                    <div className="sidebar-header">
                        <div className="sidebar-header-title"> Avatar</div>
                        <div className="sidebar-header-caret"> {accodionButtonForAvatar}</div>
                    </div>
                    <div className="sidebar-content">
                        <div className="sidebar-avatar-area">
                            <div id="sidebar-avatar-area" className="sidebar-avatar-area-canvas-container"></div>
                            <div id="sidebar-avatar-area2" className="sidebar-avatar-area-canvas-container">
                                <canvas id="test-canvas"></canvas>
                            </div>

                            <div className="sidebar-zoom-area-input">
                                <div className="sidebar-zoom-area-input-label">motions</div>
                                <div className="sidebar-zoom-area-input-setter-container">{motionButtons}</div>
                            </div>

                            <div className="sidebar-zoom-area-input">
                                <div className="sidebar-zoom-area-input-label">speaker</div>
                                <div className="sidebar-zoom-area-input-setter-container">
                                    {langSelector}
                                    {speakerSelector}
                                </div>
                            </div>

                            <div className="sidebar-zoom-area-input">
                                <div className="sidebar-zoom-area-input-label">text</div>
                                <div className="sidebar-zoom-area-input-setter-container">
                                    <input type="text" className="sidebar-zoom-area-input-text" id="sidebar-avatar-area-voice-text" />
                                </div>
                            </div>

                            <div className="sidebar-zoom-area-input">
                                {" "}
                                <div className="sidebar-zoom-area-input-label"></div>
                                <div className="sidebar-zoom-area-input-setter-container sidebar-zoom-area-input-setter-right">
                                    <div
                                        className="sidebar-zoom-area-input-setter-button1"
                                        onClick={() => {
                                            speakClicked();
                                        }}
                                    >
                                        speak
                                    </div>
                                    <input
                                        id="capture-checkbox"
                                        className="sidebar-zoom-area-checkbox"
                                        type="checkbox"
                                        defaultChecked={echoBack}
                                        onChange={(ev) => {
                                            setEchoback(ev.target.checked);
                                        }}
                                    />
                                    : echo
                                </div>
                            </div>

                            <div className="sidebar-zoom-area-input">
                                <div className="sidebar-zoom-area-input-label">recognition</div>
                                <div className="sidebar-zoom-area-input-setter-container">
                                    {speachRecognitonLanguagesSelector}
                                    <input
                                        id="sidebar-recognition-button-toggle"
                                        className="sidebar-zoom-area-input-setter-toggle"
                                        type="checkbox"
                                        onClick={() => {
                                            if (isRecognitionEnableSync == isRecognitionEnabledRef.current) {
                                                recognitionClicked();
                                            }
                                        }}
                                    />
                                    <label htmlFor="sidebar-recognition-button-toggle" className="sidebar-zoom-area-input-setter-toggle-label" />
                                    <div className="sidebar-zoom-area-input-setter-text">{isRecognitionEnableSync ? "on" : "off"}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {sidebarAccordionAvatarVideoCheckbox.trigger}
                <div className="sidebar-partition">
                    <div className="sidebar-header">
                        <div className="sidebar-header-title"> Avatar Control</div>
                        <div className="sidebar-header-caret"> {accodionButtonForAvatarVideo}</div>
                    </div>
                    <div className="sidebar-content">
                        <audio id="sidebar-generate-voice-player"></audio>
                    </div>
                </div>
            </div>
        </>
    );
};
