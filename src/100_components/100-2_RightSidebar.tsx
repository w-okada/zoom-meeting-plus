import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAppState } from "../003_provider/AppStateProvider";
import { useStateControlCheckbox } from "./hooks/useStateControlCheckbox";
import { AnimationTypes, HeaderButton, HeaderButtonProps } from "./parts/002_HeaderButton";
import { PosePredictionEx } from "@dannadori/mediapipe-avatar-js/dist/MotionDetector";
import { Side, TFace, THand, TPose } from "@dannadori/mediapipe-avatar-js/dist/kalido";
import { useAppSetting } from "../003_provider/AppSettingProvider";
import { SpeachRecognitionLanguagesKeys, useSpeachRecognition } from "./hooks/useSpeachRecognition";
import { SpeachRecognitionLanguages } from "./hooks/SpeachRecognitherLanguages";
import { VoskLanguages } from "../002_hooks/302_useVosk";
import { Header } from "./100-1_Header";

let GlobalLoopID = 0;

export const RightSidebar = () => {
    const { frontendManagerState, threeState, timeKeeperState, avatarControlState, browserProxyState, resourceManagerState, deviceManagerState, motionPlayerState, voskState } = useAppState();
    const { applicationSetting } = useAppSetting();
    const voiceSetting = applicationSetting!.voice_setting;
    const [voice, setVoice] = useState<Blob | null>(null);
    const { languageKey, recognitionStartSync, setLanguageKey } = useSpeachRecognition();
    const isRecognitionEnabledRef = useRef<boolean>(false);
    const [isRecognitionEnableSync, setIsRecognitionEnableSync] = useState<boolean>(false);

    const sidebarAccordionAvatarCheckbox = useStateControlCheckbox("sidebar-accordion-avatar-checkbox");
    const sidebarAccordionAvatarVideoCheckbox = useStateControlCheckbox("sidebar-accordion-avatar-video-checkbox");
    const sidebarAccordionTranscribeCheckbox = useStateControlCheckbox("sidebar-accordion-Transcribe-checkbox");

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
    //// (1-3) accordion button for transcribe
    const accodionButtonForTranscribe = useMemo(() => {
        const accodionButtonForTranscribeProps: HeaderButtonProps = {
            stateControlCheckbox: sidebarAccordionTranscribeCheckbox,
            tooltip: "Open/Close",
            onIcon: ["fas", "caret-up"],
            offIcon: ["fas", "caret-up"],
            animation: AnimationTypes.spinner,
            tooltipClass: "tooltip-right",
        };
        return <HeaderButton {...accodionButtonForTranscribeProps}></HeaderButton>;
    }, []);

    /**
     * (2)According Initial State
     */
    useEffect(() => {
        sidebarAccordionAvatarCheckbox.updateState(true);
        sidebarAccordionAvatarVideoCheckbox.updateState(true);
        sidebarAccordionTranscribeCheckbox.updateState(false);
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
        };
        play();
    }, [voice]);

    ////// (3-1-1) Speaker Setting
    const [localLangSpeakerMap, setLocalLangSpeakerMap] = useState<{ [lang: string]: string[] }>({});
    const [selectedLang, setSelectedLang] = useState<string>(voiceSetting.default_voice_lang);
    const [selectedSpeaker, setSelectedSpeaker] = useState<string>(voiceSetting.default_voice_speaker);
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

    //// (3-2) Time Keeper
    ////// (3-2-1) Show Dialog
    const showTimeKeeperDialog = () => {
        frontendManagerState.stateControls.timeKeeperSettingDialogCheckbox.updateState(true);
    };
    ////// (3-2-2) Remove TimeKeeper
    const removeTimeKeep = () => {
        timeKeeperState.setTimeKeeperProps({
            endTime: "",
            enable: false,
            oneMinuteEnable: false,
            threeMinutesEnable: false,
            fiveMinutesEnable: false,
        });
    };
    ////// (3-2-3) Update Label (end time)
    const endTimeLabel = useMemo(() => {
        if (timeKeeperState.endTime.split(":").length == 2) {
            return `End Time:${timeKeeperState.endTime}`;
        } else {
            return `no time keep`;
        }
    }, [timeKeeperState]);
    ////// (3-2-4) Update Label (remaining time)
    useEffect(() => {
        const div = document.getElementById("sidebar-avatar-area-time-keeper-label-remain") as HTMLDivElement;
        let timeout: NodeJS.Timeout | null = null;
        const updateRemainTime = () => {
            const remain = timeKeeperState.calcRemainTime(timeKeeperState.endTime) / 1000;
            div.innerText = `${remain}`;
            if (timeKeeperState.enable) {
                timeout = setTimeout(updateRemainTime, 1000 * 1);
            }
        };
        updateRemainTime();
        return () => {
            clearTimeout(timeout!);
        };
    }, [timeKeeperState]);

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

    //// (3-4) Motion Capture
    const motionCaptureEnableRef = useRef(false);
    const useMotionCapture = (ev: React.ChangeEvent<HTMLInputElement>) => {
        motionCaptureEnableRef.current = ev.target.checked;
    };

    //// (3-5) use Body Rig
    const useUpperBodyChanged = (ev: React.ChangeEvent<HTMLInputElement>) => {
        avatarControlState.useBodyRig(ev.target.checked);
    };

    const updateSmaWindowSize = (ev: React.ChangeEvent<HTMLInputElement>) => {
        avatarControlState.setSmaWinSize(Number(ev.target.value));
    };

    /**
     * (4) Avatar Motion Loop
     */
    const recordMotionEnabledRef = useRef(false);
    const [recordMotionEnabled, setRecordMotionEnabled] = useState<boolean>(false);
    const motionFramesForRec = useRef<any[]>([]);
    const motionFramesForPlay = useRef<any[]>([]);
    const currentTimeRef = useRef<number>(0);
    //// (4-0) アバター格納用div登録
    useEffect(() => {
        const avatarDiv = document.getElementById("sidebar-avatar-area") as HTMLDivElement;
        threeState.setParentDiv(avatarDiv);
    }, []);

    //// (4-1) メインループ
    useEffect(() => {
        console.log("Renderer Initialized");
        let renderRequestId: number;
        const LOOP_ID = performance.now();
        GlobalLoopID = LOOP_ID;

        const snap = document.createElement("canvas");
        // const snap = document.getElementById("snap") as HTMLCanvasElement;
        const snapCtx = snap.getContext("2d")!;
        // snapCtx.setTransform(1, 0, 0, 1, 0, 0);

        const input = document.getElementById("sidebar-avatar-area-video") as HTMLVideoElement;
        snap.width = 300;
        snap.height = 300;
        // snapCtx.translate(snap.width, 0);
        // snapCtx.scale(-1, 1);

        /// アバターのポーズ更新の内部関数
        const updatePose = (_poses: PosePredictionEx | null, faceRig: TFace | null, leftHandRig: THand<Side> | null, rightHandRig: THand<Side> | null, poseRig: TPose | null) => {
            if (faceRig) {
                if (browserProxyState.voiceDiffRef.current > 40) {
                    faceRig.mouth.shape.A = 0.5;
                } else if (browserProxyState.voiceDiffRef.current > 30) {
                    faceRig.mouth.shape.A = 0.3;
                } else if (browserProxyState.voiceDiffRef.current > 20) {
                    faceRig.mouth.shape.I = 0.4;
                } else if (browserProxyState.voiceDiffRef.current > 10) {
                    faceRig.mouth.shape.U = 0.6;
                } else if (browserProxyState.voiceDiffRef.current > 1) {
                    faceRig.mouth.shape.O = 0.3;
                }
            }
            // avatarControlState.avatar.updatePose(faceRig, poseRig, leftHandRig, rightHandRig);
            if (avatarControlState.isInitialized) {
                avatarControlState.avatar.isTargetVisible = false;
                // avatarControlState.avatar.updatePoseWithRaw(faceRig, poseRig, leftHandRig, rightHandRig, _poses);
                avatarControlState.avatar.updatePose(faceRig, poseRig, leftHandRig, rightHandRig);
            }
        };

        //// レンダリングループ

        const render = async () => {
            if (motionCaptureEnableRef.current) {
                snapCtx.drawImage(input, 0, 0, snap.width, snap.height);
                try {
                    if (snap.width > 0 && snap.height > 0) {
                        const { poses, faceRig, leftHandRig, rightHandRig, poseRig } = await avatarControlState.detector.predict(snap);
                        updatePose(poses, faceRig, leftHandRig, rightHandRig, poseRig);
                        if (recordMotionEnabledRef.current) {
                            const currentTime = new Date().getTime();
                            const interval = currentTime - currentTimeRef.current;
                            motionFramesForRec.current.push({ poses, faceRig, leftHandRig, rightHandRig, poseRig, interval: interval });
                            currentTimeRef.current = currentTime;
                        }
                    }
                } catch (error) {
                    console.log(error);
                }
            } else {
                if (motionFramesForPlay.current.length > 0) {
                    const frame = JSON.parse(JSON.stringify(motionFramesForPlay.current.shift()));
                    updatePose(frame.poses, frame.faceRig, frame.leftHandRig, frame.rightHandRig, frame.poseRig);
                    //// Motion Replayの場合は、フレーム間のインターバル分のウェイトをかける。
                    if (motionFramesForPlay.current.length > 0) {
                        const interval = motionFramesForPlay.current[0].interval;
                        await new Promise((resolve) => {
                            setTimeout(resolve, interval);
                        });
                    }
                } else {
                    //// フレームがなくなった場合、次のデフォルト動作を積み込む。
                    if (motionPlayerState.motions.length > 0) {
                        motionFramesForPlay.current = [...motionPlayerState.motions[0].motion];
                    }
                }
            }

            threeState.controls.update();
            threeState.character?.springBoneManager?.springBoneGroupList.forEach((element) => {
                element.forEach((node) => {
                    node.update(2);
                });
            });
            threeState.character?.springBoneManager?.lateUpdate(10);

            threeState.renderer?.render(threeState.scene!, threeState.camera!);
            if (GlobalLoopID === LOOP_ID) {
                renderRequestId = requestAnimationFrame(render);
            }
        };
        render();

        return () => {
            console.log("CANCEL", renderRequestId);
            cancelAnimationFrame(renderRequestId);
        };
    }, [threeState, motionPlayerState.motions, avatarControlState.isInitialized]);

    //// (x) motion capture
    const setRecordingStart = (ev: React.ChangeEvent<HTMLInputElement>) => {
        recordMotionEnabledRef.current = ev.target.checked;
        setRecordMotionEnabled(recordMotionEnabledRef.current);
        if (ev.target.checked === true) {
            motionFramesForRec.current = [];
            currentTimeRef.current = new Date().getTime();
        }
    };
    const setNewMotion = () => {
        const motionNameInput = document.getElementById("motion-name") as HTMLInputElement;
        console.log(motionFramesForRec.current);
        const motionName = motionNameInput.value.length > 0 ? motionNameInput.value : "new";
        if (motionFramesForRec.current.length > 0) {
            motionPlayerState.setMotion(motionName, motionFramesForRec.current);
        }
        // motionFramesForRec.current = [];
    };
    const replayNewMotion = () => {
        console.log("not implemented");
    };
    const downloadMotion = () => {
        const blob = new Blob([JSON.stringify(motionFramesForRec.current)], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        document.body.appendChild(a);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        a.style = "display: none";
        a.href = url;
        a.download = "motion.json";
        a.click();
        window.URL.revokeObjectURL(url);
    };
    // const openMotionDialog = () => {
    //     console.log("not implemented");
    // };

    // (5) video initialize
    useEffect(() => {
        const videoElem = document.getElementById("sidebar-avatar-area-video") as HTMLVideoElement;
        deviceManagerState.setVideoElement(videoElem);
    }, []);
    const motionButtons = useMemo(() => {
        const b = motionPlayerState.motions.map((m) => {
            const button = (
                <div
                    key={m.name}
                    className="sidebar-zoom-area-motion-button"
                    onClick={async () => {
                        motionFramesForPlay.current = [...m.motion];
                    }}
                >
                    {m.name.split(".")[0]}
                </div>
            );
            return button;
        });
        b.unshift(
            <div
                key={"rest"}
                className="sidebar-zoom-area-motion-button"
                onClick={async () => {
                    console.log("rest");
                    threeState.resetAvatar();
                }}
            >
                reset
            </div>
        );
        return b;
    }, [motionPlayerState.motions, threeState.character]);

    // (6) Transcription
    const voskLanguageSelector = useMemo(() => {
        const keys = Object.keys(VoskLanguages).sort((a, b) => {
            return a < b ? -1 : 1;
        });
        const selector = (
            <select
                id="sidebar-vosk-lang-selector "
                className="sidebar-vosk-lang-selector "
                onChange={(ev) => {
                    voskState.setLanguage(ev.target.value as VoskLanguages);
                }}
                value={voskState.language}
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
    }, [voskState.language]);
    const startTranscribe = () => {
        voskState.setIsTranscribeStated(true);
    };
    const stopTranscribe = () => {
        voskState.setIsTranscribeStated(false);
    };
    const clearTranscribeResults = () => {
        voskState.clearResults();
    };
    const transcribeTexts = useMemo(() => {
        return voskState.results.map((x, index) => {
            return (
                <p className="sidebar-transcribe-text-phrase" key={`trans-${index}`}>
                    {x}
                </p>
            );
        });
    }, [voskState.results]);
    useEffect(() => {
        const obj = document.getElementById("sidebar-transcribe-text-container") as HTMLDivElement;
        obj.scrollTop = obj.scrollHeight;
    }, [voskState.results]);

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
                            <div className="sidebar-zoom-area-input">
                                <div className="sidebar-zoom-area-input-label">Time Keeper</div>
                                <div className="sidebar-zoom-area-input-setter-container">
                                    <div>
                                        {endTimeLabel}(<span id="sidebar-avatar-area-time-keeper-label-remain"></span>)
                                    </div>
                                </div>
                            </div>

                            <div className="sidebar-zoom-area-input">
                                <div className="sidebar-zoom-area-input-label"></div>
                                <div className="sidebar-zoom-area-input-setter-container">
                                    <div
                                        className="sidebar-zoom-area-input-setter-button1"
                                        onClick={() => {
                                            showTimeKeeperDialog();
                                        }}
                                    >
                                        set
                                    </div>
                                    <div
                                        className="sidebar-zoom-area-input-setter-button1"
                                        onClick={() => {
                                            removeTimeKeep();
                                        }}
                                    >
                                        remove
                                    </div>
                                </div>
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
                        <video id="sidebar-avatar-area-video" className="sidebar-avatar-area-video" controls autoPlay></video>
                        {/* <canvas id="snap"></canvas> */}
                        <audio id="sidebar-generate-voice-player"></audio>

                        <div className="sidebar-zoom-area-input">
                            <div className="sidebar-zoom-area-input-label">capture</div>
                            <div className="sidebar-zoom-area-input-setter-container sidebar-zoom-area-input-setter-right">
                                <input
                                    id="capture-checkbox"
                                    className="sidebar-zoom-area-toggle-input"
                                    type="checkbox"
                                    onChange={(ev) => {
                                        useMotionCapture(ev);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="sidebar-zoom-area-input">
                            <div className="sidebar-zoom-area-input-label">upper body</div>
                            <div className="sidebar-zoom-area-input-setter-container sidebar-zoom-area-input-setter-right">
                                <input
                                    id="use-upper-body-checkbox"
                                    className="sidebar-zoom-area-toggle-input"
                                    type="checkbox"
                                    onChange={(ev) => {
                                        useUpperBodyChanged(ev);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="sidebar-zoom-area-input">
                            <div className="sidebar-zoom-area-input-label">SMA win size</div>
                            <div className="sidebar-zoom-area-input-setter-container sidebar-zoom-area-input-setter-right">
                                <input
                                    id="moving-average-window-size"
                                    className="sidebar-zoom-area-toggle-input"
                                    type="number"
                                    min="1"
                                    max="20"
                                    step="1"
                                    defaultValue={avatarControlState.smaWinSize}
                                    onChange={(ev) => {
                                        updateSmaWindowSize(ev);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="sidebar-zoom-area-input">
                            <div className="sidebar-zoom-area-input-label">rec motion</div>
                            <div className="sidebar-zoom-area-input-setter-container sidebar-zoom-area-input-setter-right">
                                <input
                                    id="sidebar-motion-recorder-button-toggle"
                                    className="sidebar-zoom-area-input-setter-toggle"
                                    type="checkbox"
                                    onChange={(ev) => {
                                        setRecordingStart(ev);
                                    }}
                                />
                                <label htmlFor="sidebar-motion-recorder-button-toggle" className="sidebar-zoom-area-input-setter-toggle-label" />
                                <div className="sidebar-zoom-area-input-setter-text">{recordMotionEnabled ? "on" : "off"}</div>

                                <div
                                    className="sidebar-zoom-area-input-setter-button1"
                                    onClick={() => {
                                        replayNewMotion();
                                    }}
                                >
                                    Re.
                                </div>
                                <div
                                    className="sidebar-zoom-area-input-setter-button1"
                                    onClick={() => {
                                        downloadMotion();
                                    }}
                                >
                                    DL.
                                </div>
                            </div>
                        </div>

                        <div className="sidebar-zoom-area-input">
                            <div className="sidebar-zoom-area-input-label"></div>
                            <div className="sidebar-zoom-area-input-setter-container ">
                                <div>name:</div>
                                <input type="text" className="sidebar-zoom-area-input-text-small" id="motion-name" />
                                <div
                                    className="sidebar-zoom-area-input-setter-button1"
                                    onClick={() => {
                                        setNewMotion();
                                    }}
                                >
                                    set
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {sidebarAccordionTranscribeCheckbox.trigger}
                <div className="sidebar-partition">
                    <div className="sidebar-header">
                        <div className="sidebar-header-title"> Transcribe</div>
                        <div className="sidebar-header-caret"> {accodionButtonForTranscribe}</div>
                    </div>
                    <div className="sidebar-content">
                        <div className="sidebar-zoom-area-input">
                            <div id="sidebar-transcribe-text-container" className="sidebar-transcribe-text-container">
                                {transcribeTexts}
                            </div>
                        </div>
                        <div className="sidebar-zoom-area-input">
                            {voskLanguageSelector}
                            <div className="sidebar-zoom-area-input-setter-container ">
                                <input
                                    id="sidebar-transcribe-start-toggle"
                                    className="sidebar-zoom-area-input-setter-toggle"
                                    type="checkbox"
                                    onClick={() => {
                                        if (voskState.isTranscribeStated) {
                                            stopTranscribe();
                                        } else {
                                            startTranscribe();
                                        }
                                    }}
                                />
                                <label htmlFor="sidebar-transcribe-start-toggle" className="sidebar-zoom-area-input-setter-toggle-label" />
                                <div className="sidebar-zoom-area-input-setter-text">{voskState.isTranscribeStated ? "on" : "off"}</div>
                                <div
                                    className="sidebar-zoom-area-input-setter-button1"
                                    onClick={() => {
                                        clearTranscribeResults();
                                    }}
                                >
                                    clear
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
