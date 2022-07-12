import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAppState } from "../003_provider/AppStateProvider";
import { useStateControlCheckbox } from "./hooks/useStateControlCheckbox";
import { AnimationTypes, HeaderButton, HeaderButtonProps } from "./parts/002_HeaderButton";
import { PosePredictionEx } from "@dannadori/mediapipe-avatar-js/dist/MotionDetector";
import { Side, TFace, THand, TPose } from "@dannadori/mediapipe-avatar-js/dist/kalido";
import { useMotionPlayer } from "./hooks/useMotionPlayer";
import { useAppSetting } from "../003_provider/AppSettingProvider";

let GlobalLoopID = 0;

export const RightSidebar = () => {
    const { frontendManagerState, threeState, timeKeeperState, zoomSDKState, avatarControlState, browserProxyState, resourceManagerState, deviceManagerState } = useAppState();
    const { applicationSetting } = useAppSetting();
    const voiceSetting = applicationSetting!.voice_setting;
    const [voice, setVoice] = useState<Blob | null>(null);
    const sidebarAccordionZoomCheckbox = useStateControlCheckbox("sidebar-accordion-zoom-checkbox");
    const sidebarAccordionAvatarCheckbox = useStateControlCheckbox("sidebar-accordion-avatar-checkbox");
    const sidebarAccordionAvatarVideoCheckbox = useStateControlCheckbox("sidebar-accordion-avatar-video-checkbox");
    const sidebarAccordionSlackCheckbox = useStateControlCheckbox("sidebar-accordion-slack-checkbox");
    const { motions } = useMotionPlayer();

    /**
     * (1)According Actions
     */
    //// (1-1) accordion button
    const accodionButtonForZoom = useMemo(() => {
        const accodionButtonForZoomProps: HeaderButtonProps = {
            stateControlCheckbox: sidebarAccordionZoomCheckbox,
            tooltip: "Open/Close",
            onIcon: ["fas", "caret-down"],
            offIcon: ["fas", "caret-down"],
            animation: AnimationTypes.spinner,
            tooltipClass: "tooltip-right",
        };
        return <HeaderButton {...accodionButtonForZoomProps}></HeaderButton>;
    }, []);

    //// (1-2) accordion button
    const accodionButtonForAvatar = useMemo(() => {
        const accodionButtonForAvatarProps: HeaderButtonProps = {
            stateControlCheckbox: sidebarAccordionAvatarCheckbox,
            tooltip: "Open/Close",
            onIcon: ["fas", "caret-down"],
            offIcon: ["fas", "caret-down"],
            animation: AnimationTypes.spinner,
            tooltipClass: "tooltip-right",
        };
        return <HeaderButton {...accodionButtonForAvatarProps}></HeaderButton>;
    }, []);
    //// (1-3) accordion button
    const accodionButtonForAvatarVideo = useMemo(() => {
        const accodionButtonForAvatarVideoProps: HeaderButtonProps = {
            stateControlCheckbox: sidebarAccordionAvatarVideoCheckbox,
            tooltip: "Open/Close",
            onIcon: ["fas", "caret-down"],
            offIcon: ["fas", "caret-down"],
            animation: AnimationTypes.spinner,
            tooltipClass: "tooltip-right",
        };
        return <HeaderButton {...accodionButtonForAvatarVideoProps}></HeaderButton>;
    }, []);
    //// (1-4) accordion button
    const accodionButtonForSlack = useMemo(() => {
        const accodionButtonForSlackProps: HeaderButtonProps = {
            stateControlCheckbox: sidebarAccordionSlackCheckbox,
            tooltip: "Open/Close",
            onIcon: ["fas", "caret-down"],
            offIcon: ["fas", "caret-down"],
            animation: AnimationTypes.spinner,
            tooltipClass: "tooltip-right",
        };
        return <HeaderButton {...accodionButtonForSlackProps}></HeaderButton>;
    }, []);

    /**
     * (2)According Initial State
     */
    useEffect(() => {
        sidebarAccordionZoomCheckbox.updateState(true);
        sidebarAccordionAvatarCheckbox.updateState(true);
        sidebarAccordionSlackCheckbox.updateState(false);
    }, []);

    /**
     * (3) User Operation
     */
    //// (3-1) Join Operation
    const joinClicked = async () => {
        if (!zoomSDKState.joinZoom) {
            return;
        }
        const usernameInput = document.getElementById("username") as HTMLInputElement;
        const meetingId = document.getElementById("meeting-id") as HTMLInputElement;
        const meetingPw = document.getElementById("meeting-pw") as HTMLInputElement;
        const secret = document.getElementById("secret") as HTMLInputElement;
        await zoomSDKState.joinZoom(usernameInput.value, meetingId.value, meetingPw.value, secret.value);
    };
    //// (3-2) Speak
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

    ////// (3-3-1) Speaker Setting
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
        const selector = (
            <select
                id="sidebar-lang-selector"
                className="sidebar-lang-selector"
                onChange={(ev) => {
                    setSelectedLang(ev.target.value);
                }}
                value={selectedLang}
            >
                {Object.keys(localLangSpeakerMap).map((x) => {
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
                className="sidebar-speaker-selector"
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

    //// (3-3) Time Keeper
    ////// (3-3-1) Show Dialog
    const showTimeKeeperDialog = () => {
        frontendManagerState.stateControls.timeKeeperSettingDialogCheckbox.updateState(true);
    };
    ////// (3-3-2) Remove TimeKeeper
    const removeTimeKeep = () => {
        timeKeeperState.setTimeKeeperProps({
            endTime: "",
            enable: false,
            oneMinuteEnable: false,
            threeMinutesEnable: false,
            fiveMinutesEnable: false,
        });
    };
    ////// (3-3-3) Update Label (end time)
    const endTimeLabel = useMemo(() => {
        if (timeKeeperState.endTime.split(":").length == 2) {
            return `End Time:${timeKeeperState.endTime}`;
        } else {
            return `no time keep`;
        }
    }, [timeKeeperState]);
    ////// (3-3-3) Update Label (remaining time)
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

    //// (3-4) Motion Capture
    const motionCaptureEnableRef = useRef(false);
    const useMotionCapture = (ev: React.ChangeEvent<HTMLInputElement>) => {
        motionCaptureEnableRef.current = ev.target.checked;
    };

    //// (3-5) use Body Rig
    const useUpperBodyChanged = (ev: React.ChangeEvent<HTMLInputElement>) => {
        console.log("UPPERBODY", ev.target.checked);
        avatarControlState.useBodyRig(ev.target.checked);
    };

    /**
     * (4) Avatar Motion Loop
     */
    const recordMotionEnableRef = useRef(false);
    const motionFramesForRec = useRef<any[]>([]);
    const motionFramesForPlay = useRef<any[]>([]);
    const currentTimeRef = useRef<number>(0);
    //// (4-1) メインループ
    useEffect(() => {
        console.log("Renderer Initialized");
        let renderRequestId: number;
        const LOOP_ID = performance.now();
        GlobalLoopID = LOOP_ID;

        const snap = document.createElement("canvas");
        const input = document.getElementById("sidebar-avatar-area-video") as HTMLVideoElement;
        snap.width = 300;
        snap.height = 300;

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
            avatarControlState.avatar.updatePose(faceRig, poseRig, leftHandRig, rightHandRig);

            // avatar.updatePoseWithRaw(faceRig, poseRig, leftHandRig, rightHandRig, poses);
        };

        //// レンダリングループ
        const render = async () => {
            if (motionCaptureEnableRef.current) {
                const snapCtx = snap.getContext("2d")!;
                snapCtx.drawImage(input, 0, 0, snap.width, snap.height);
                try {
                    if (snap.width > 0 && snap.height > 0) {
                        const { poses, faceRig, leftHandRig, rightHandRig, poseRig } = await avatarControlState.detector.predict(snap);
                        updatePose(poses, faceRig, leftHandRig, rightHandRig, poseRig);
                        if (recordMotionEnableRef.current) {
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
                    if (motions.length > 0) {
                        motionFramesForPlay.current = [...motions[0].motion];
                    }
                }
            }

            threeState.controls?.update();
            threeState.charactrer?.springBoneManager?.springBoneGroupList.forEach((element) => {
                element.forEach((node) => {
                    node.update(0.01);
                });
            });
            threeState.charactrer?.springBoneManager?.lateUpdate(0.1);

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
    }, [threeState, motions]);

    //// (4-2) メインループ
    const setRecordingStart = (ev: React.ChangeEvent<HTMLInputElement>) => {
        recordMotionEnableRef.current = ev.target.checked;
        if (ev.target.checked === true) {
            currentTimeRef.current = new Date().getTime();
        } else {
            const blob = new Blob([JSON.stringify(motionFramesForRec.current)], { type: "text/plain" });
            motionFramesForRec.current = [];
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
        }
    };

    // (5) video initialize
    useEffect(() => {
        // const videoElem = document.getElementById("sidebar-avatar-area-video") as HTMLVideoElement;
        // deviceManagerState.setVideoElement(videoElem);
    }, []);
    const motionButtons = useMemo(() => {
        const b = motions.map((m) => {
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
        return b;
    }, [motions]);

    //////////////////
    // Rendering   ///
    //////////////////
    return (
        <>
            {frontendManagerState.stateControls.openRightSidebarCheckbox.trigger}
            <div className="right-sidebar">
                {sidebarAccordionZoomCheckbox.trigger}
                <div className="sidebar-partition">
                    <div className="sidebar-header">
                        <div className="title"> Zoom</div>
                        <div className="caret"> {accodionButtonForZoom}</div>
                    </div>
                    <div className="sidebar-content">
                        <div className="sidebar-zoom-area">
                            <div className="sidebar-zoom-area-input">
                                <input type="text" className="sidebar-zoom-area-text" id="username" />
                                <div className="sidebar-zoom-area-label">username</div>
                            </div>
                            <div className="sidebar-zoom-area-input">
                                <input type="text" className="sidebar-zoom-area-text" id="meeting-id" />
                                <div className="sidebar-zoom-area-label">meeting num</div>
                            </div>
                            <div className="sidebar-zoom-area-input">
                                <input type="password" className="sidebar-zoom-area-password" id="meeting-pw" />
                                <div className="sidebar-zoom-area-label">password</div>
                            </div>
                            <div className="sidebar-zoom-area-input">
                                <input type="password" className="sidebar-zoom-area-password" id="secret" />
                                <div className="sidebar-zoom-area-label">secret</div>
                            </div>
                            <div className="sidebar-zoom-area-input">
                                <div
                                    className="sidebar-zoom-area-button"
                                    onClick={() => {
                                        joinClicked();
                                    }}
                                >
                                    join
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {sidebarAccordionAvatarCheckbox.trigger}
                <div className="sidebar-partition">
                    <div className="sidebar-header">
                        <div className="title"> Avatar</div>
                        <div className="caret"> {accodionButtonForAvatar}</div>
                    </div>
                    <div className="sidebar-content">
                        <div className="sidebar-avatar-area">
                            <div id="sidebar-avatar-area" className="sidebar-avatar-canvas-container"></div>
                            <div className="sidebar-avatar-area-time-keeper-container">
                                <div className="sidebar-avatar-area-time-keeper-label">{endTimeLabel}</div>
                                <div id="sidebar-avatar-area-time-keeper-label-remain" className="sidebar-avatar-area-time-keeper-label"></div>
                                <div className="sidebar-avatar-area-time-keeper-buttons">
                                    <div
                                        className="sidebar-avatar-area-time-keeper-button"
                                        onClick={() => {
                                            showTimeKeeperDialog();
                                        }}
                                    >
                                        set
                                    </div>
                                    <div
                                        className="sidebar-avatar-area-time-keeper-button"
                                        onClick={() => {
                                            removeTimeKeep();
                                        }}
                                    >
                                        remove
                                    </div>
                                </div>
                            </div>
                            {/* <div className="sidebar-avatar-area-buttons">{motionButtons}</div>
                             */}
                            <div className="sidebar-zoom-area-input">
                                {langSelector}
                                {speakerSelector}
                                <div className="sidebar-zoom-area-label">speaker</div>
                            </div>
                            <div className="sidebar-zoom-area-input">
                                <input type="text" className="sidebar-zoom-area-voice-text" id="sidebar-avatar-area-voice-text" />
                                <div className="sidebar-zoom-area-label">text</div>
                            </div>

                            <div className="sidebar-zoom-area-input">
                                <div
                                    className="sidebar-zoom-area-button"
                                    onClick={() => {
                                        speakClicked();
                                    }}
                                >
                                    speak
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {sidebarAccordionAvatarVideoCheckbox.trigger}
                <div className="sidebar-partition">
                    <div className="sidebar-header">
                        <div className="title"> Avatar Control</div>
                        <div className="caret"> {accodionButtonForAvatarVideo}</div>
                    </div>
                    <div className="sidebar-content">
                        <video id="sidebar-avatar-area-video" className="sidebar-avatar-area-video" controls autoPlay></video>
                        <audio id="sidebar-generate-voice-player"></audio>

                        <div className="sidebar-zoom-area-input">
                            <div className="sidebar-zoom-area-toggle-switch">
                                <input
                                    id="use-upper-body-checkbox"
                                    className="sidebar-zoom-area-toggle-input"
                                    type="checkbox"
                                    onChange={(ev) => {
                                        useMotionCapture(ev);
                                    }}
                                />
                            </div>
                            <div className="sidebar-zoom-area-label">motion capture</div>
                        </div>
                        <div className="sidebar-zoom-area-input">
                            <div className="sidebar-zoom-area-toggle-switch">
                                <input
                                    id="use-upper-body-checkbox"
                                    className="sidebar-zoom-area-toggle-input"
                                    type="checkbox"
                                    onChange={(ev) => {
                                        useUpperBodyChanged(ev);
                                    }}
                                />
                            </div>
                            <div className="sidebar-zoom-area-label">upper body(exp.)</div>
                        </div>
                        <div className="sidebar-zoom-area-input">
                            <div className="sidebar-zoom-area-toggle-switch">
                                <input
                                    id="use-upper-body-checkbox"
                                    className="sidebar-zoom-area-toggle-input"
                                    type="checkbox"
                                    onChange={(ev) => {
                                        setRecordingStart(ev);
                                    }}
                                />
                            </div>
                            <div className="sidebar-zoom-area-label">record motion</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
