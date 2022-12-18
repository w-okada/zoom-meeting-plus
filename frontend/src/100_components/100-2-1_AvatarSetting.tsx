import React, { useEffect } from "react";

export const AvatarSetting = () => {
    // const { frontendManagerState, browserProxyState, resourceManagerState } = useAppState();
    // const { applicationSettingState } = useAppSetting();

    // const sidebarAccordionAvatarCheckbox = useStateControlCheckbox("sidebar-accordion-avatar-checkbox");
    // const sidebarAccordionMMVCCheckbox = useStateControlCheckbox("sidebar-accordion-mmvc-checkbox");
    // const sidebarAccordionVoicevoxCheckbox = useStateControlCheckbox("sidebar-accordion-voicevox-checkbox");

    // const psdAnimator = useMemo(() => {
    //     return new WorkerManager()
    // }, [])


    // useEffect(() => {
    //     const load = async () => {
    //         const canvasElement = document.getElementById("psd-animation-canvas") as HTMLCanvasElement;
    //         const psdFile = await resourceManagerState.fetchPSD(applicationSettingState.applicationSetting.psd_animator_setting.psd_url)

    //         const config = generateConfig(psdFile, canvasElement, 1024, 960, true)
    //         // const config = generateConfig(psdFile, canvasElement, 640, 480, false)
    //         await psdAnimator.init(config)
    //         const p1: OperationParams = {
    //             type: "SET_MOTION",
    //             motion: AnimationInfo
    //         }
    //         await psdAnimator.execute(p1)
    //         console.log("set motion")
    //         const p2: OperationParams = {
    //             type: "SWITCH_MOTION_MODE",
    //             // motionMode: "talking",
    //             motionMode: "normal",
    //         }
    //         await psdAnimator.execute(p2)
    //         console.log("set motion mode")

    //         const p3: OperationParams = {
    //             type: "START",
    //         }
    //         await psdAnimator.execute(p3)
    //         console.log("start motion")


    //         const p4: OperationParams = {
    //             type: "SET_WAIT_RATE",
    //             waitRate: 1
    //         }
    //         await psdAnimator.execute(p4)
    //         console.log("start wait rate")
    //     }
    //     load()

    // }, [])

    // /**
    //  * (1)According Actions
    //  */
    // //// (1-1) accordion button for avatar
    // const accodionButtonForAvatar = useMemo(() => {
    //     const accodionButtonForAvatarProps: HeaderButtonProps = {
    //         stateControlCheckbox: sidebarAccordionAvatarCheckbox,
    //         tooltip: "Open/Close",
    //         onIcon: ["fas", "caret-up"],
    //         offIcon: ["fas", "caret-up"],
    //         animation: AnimationTypes.spinner,
    //         tooltipClass: "tooltip-right",
    //     };
    //     return <HeaderButton {...accodionButtonForAvatarProps}></HeaderButton>;
    // }, []);
    // //// (1-2) accordion button for mmvc
    // const accodionButtonForMMVC = useMemo(() => {
    //     const accodionButtonForMMVCProps: HeaderButtonProps = {
    //         stateControlCheckbox: sidebarAccordionMMVCCheckbox,
    //         tooltip: "Open/Close",
    //         onIcon: ["fas", "caret-up"],
    //         offIcon: ["fas", "caret-up"],
    //         animation: AnimationTypes.spinner,
    //         tooltipClass: "tooltip-right",
    //     };
    //     return <HeaderButton {...accodionButtonForMMVCProps}></HeaderButton>;
    // }, []);
    // //// (1-3) accordion button for voicevox
    // const accodionButtonForVoicevox = useMemo(() => {
    //     const accodionButtonForVoicevoxProps: HeaderButtonProps = {
    //         stateControlCheckbox: sidebarAccordionVoicevoxCheckbox,
    //         tooltip: "Open/Close",
    //         onIcon: ["fas", "caret-up"],
    //         offIcon: ["fas", "caret-up"],
    //         animation: AnimationTypes.spinner,
    //         tooltipClass: "tooltip-right",
    //     };
    //     return <HeaderButton {...accodionButtonForVoicevoxProps}></HeaderButton>;
    // }, []);
    // /**
    //  * (2)According Initial State
    //  */
    // useEffect(() => {
    //     sidebarAccordionAvatarCheckbox.updateState(true);
    //     sidebarAccordionMMVCCheckbox.updateState(true);
    //     sidebarAccordionVoicevoxCheckbox.updateState(true);
    // }, []);

    // /**
    //  * (3) User Operation
    //  */
    // //// (3-1) Speak
    // const speakClicked = async () => {
    //     const text = document.getElementById("sidebar-avatar-area-voice-text") as HTMLInputElement;
    //     const lang = document.getElementById("sidebar-lang-selector") as HTMLInputElement;
    //     const speaker = document.getElementById("sidebar-speaker-selector") as HTMLInputElement;
    //     console.log(text.value, lang.value, speaker.value);

    //     if (resourceManagerState.speakersInVoiceVox[speaker.value]) {
    //         const speakerId = resourceManagerState.speakersInVoiceVox[speaker.value];
    //         const voice = await resourceManagerState.generateVoiceWithVoiceVox(speakerId, text.value);
    //         setVoice(voice);
    //     } else if (resourceManagerState.speakersInOpenTTS[lang.value]) {
    //         const voice = await resourceManagerState.generateVoiceWithOpenTTS(lang.value, speaker.value, text.value);
    //         setVoice(voice);
    //     }
    // };

    // useEffect(() => {
    //     if (!voice) {
    //         return;
    //     }
    //     const play = async () => {
    //         browserProxyState.playAudio(await voice.arrayBuffer());
    //         if (echoBack) {
    //             const echobackAudio = document.getElementById("sidebar-generate-voice-player") as HTMLAudioElement;
    //             echobackAudio.src = URL.createObjectURL(voice);
    //             echobackAudio.play();
    //         }
    //         setVoice(null);
    //     };
    //     play();
    // }, [voice, echoBack]);

    // ////// (3-1-1) Speaker Setting
    // const [localLangSpeakerMap, setLocalLangSpeakerMap] = useState<{ [lang: string]: string[] }>({});
    // const [selectedLang, setSelectedLang] = useState<string>(voiceSetting.voice_lang);
    // const [selectedSpeaker, setSelectedSpeaker] = useState<string>(voiceSetting.voice_speaker);
    // useEffect(() => {
    //     const langSpeakerMap = { ...resourceManagerState.speakersInOpenTTS };
    //     if (!langSpeakerMap["ja"]) {
    //         langSpeakerMap["ja"] = [];
    //     }
    //     langSpeakerMap["ja"] = [...langSpeakerMap["ja"], ...Object.keys(resourceManagerState.speakersInVoiceVox)];
    //     setLocalLangSpeakerMap({ ...langSpeakerMap });
    // }, [resourceManagerState.speakersInOpenTTS, resourceManagerState.speakersInVoiceVox]);

    // const speakerSelector = useMemo(() => {
    //     if (!localLangSpeakerMap[selectedLang]) {
    //         return <></>;
    //     }
    //     const selector = (
    //         <select
    //             id="sidebar-speaker-selector"
    //             className="sidebar-zoom-area-speaker-selector"
    //             onChange={(ev) => {
    //                 setSelectedSpeaker(ev.target.value);
    //             }}
    //             value={selectedSpeaker}
    //         >
    //             {localLangSpeakerMap[selectedLang].map((x) => {
    //                 return (
    //                     <option key={x} value={x}>
    //                         {x}
    //                     </option>
    //                 );
    //             })}
    //         </select>
    //     );
    //     return selector;
    // }, [localLangSpeakerMap, selectedLang, selectedSpeaker]);



    // //// (3-3)
    // const speachRecognitonLanguagesSelector = useMemo(() => {
    //     const selector = (
    //         <select
    //             id="sidebar-lang-selector"
    //             className="sidebar-zoom-area-lang-selector"
    //             onChange={(ev) => {
    //                 setLanguageKey(ev.target.value as SpeachRecognitionLanguagesKeys);
    //             }}
    //             value={languageKey}
    //         >
    //             {Object.keys(SpeachRecognitionLanguages).map((x) => {
    //                 return (
    //                     <option key={x} value={x}>
    //                         {x}
    //                     </option>
    //                 );
    //             })}
    //         </select>
    //     );
    //     return selector;
    // }, [languageKey]);

    // const recognitionClicked = async () => {
    //     isRecognitionEnabledRef.current = !isRecognitionEnabledRef.current;
    //     console.log("recognitionClicked", isRecognitionEnabledRef.current);

    //     if (isRecognitionEnabledRef.current) {
    //         setIsRecognitionEnableSync(true);
    //         const recognition = async () => {
    //             const message = await recognitionStartSync();
    //             console.log("MESSAGE:", message);
    //             const generateVoice = async () => {
    //                 const lang = document.getElementById("sidebar-lang-selector") as HTMLInputElement;
    //                 const speaker = document.getElementById("sidebar-speaker-selector") as HTMLInputElement;
    //                 if (resourceManagerState.speakersInVoiceVox[speaker.value]) {
    //                     const speakerId = resourceManagerState.speakersInVoiceVox[speaker.value];
    //                     const voice = await resourceManagerState.generateVoiceWithVoiceVox(speakerId, message);
    //                     setVoice(voice);
    //                 } else if (resourceManagerState.speakersInOpenTTS[lang.value]) {
    //                     const voice = await resourceManagerState.generateVoiceWithOpenTTS(lang.value, speaker.value, message);
    //                     setVoice(voice);
    //                 }
    //             };
    //             if (message.length > 0) {
    //                 generateVoice();
    //             }
    //             if (isRecognitionEnabledRef.current) {
    //                 recognition();
    //             } else {
    //                 setIsRecognitionEnableSync(false);
    //             }
    //         };
    //         recognition();
    //     }
    // };


    // const motionButtons = useMemo(() => {
    //     return <></>
    // }, []);

    // //////////////////
    // // Rendering   ///
    // //////////////////
    useEffect(() => {
        const draw = async () => {
            const c = document.getElementById("psd-animation-canvas") as HTMLCanvasElement
            const ctx = c.getContext("2d")!
            ctx.fillStyle = "rgba(100,100,100,110)"
            ctx.fillRect(0, 0, c.width, c.height)
            requestAnimationFrame(draw)
        }
        draw()
    }, [])
    return (
        <>
            <div className="sidebar-content">
                <div className="sidebar-avatar-area">
                    <div id="sidebar-avatar-area" className="sidebar-content-row-card">
                        <canvas id="psd-animation-canvas"></canvas>
                    </div>

                    <div className="sidebar-content-row-3-7">
                        <div className="sidebar-content-row-label">motions</div>
                        {/* <div className="sidebar-zoom-area-input-setter-container">{motionButtons}</div> */}
                    </div>



                </div>
            </div>

        </>
    );
};
