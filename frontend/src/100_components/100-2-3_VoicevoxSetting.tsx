import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAppSetting } from "../003_provider/001_AppSettingProvider";
import { SpeachRecognitionLanguagesKeys, useSpeachRecognition } from "./hooks/useSpeachRecognition";
import { SpeachRecognitionLanguages } from "./hooks/SpeachRecognitherLanguages";
import { useAppState } from "../003_provider/003_AppStateProvider";
import { DeviceSelector } from "./parts/101_DeviceSelector";


export const VoicevoxSetting = () => {
    const { applicationSettingState, deviceManagerState } = useAppSetting();
    const { resourceManagerState, browserProxyState } = useAppState();
    const { languageKey, recognitionStartSync, setLanguageKey } = useSpeachRecognition();

    const voiceSetting = applicationSettingState.applicationSetting.voicevox_setting;
    const [voice, setVoice] = useState<Blob | null>(null);
    const isRecognitionEnabledRef = useRef<boolean>(false);

    const [isRecognitionEnableSync, setIsRecognitionEnableSync] = useState<boolean>(false);
    const [echoBack, setEchoback] = useState<boolean>(true);

    const [localLangSpeakerMap, setLocalLangSpeakerMap] = useState<{ [lang: string]: string[] }>({});

    useEffect(() => {
        deviceManagerState.loadedEchobackAudio()
    }, [])

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

    useEffect(() => {
        const langSpeakerMap = { ...resourceManagerState.speakersInOpenTTS };
        if (!langSpeakerMap["ja"]) {
            langSpeakerMap["ja"] = [];
        }
        langSpeakerMap["ja"] = [...langSpeakerMap["ja"], ...Object.keys(resourceManagerState.speakersInVoiceVox)];
        setLocalLangSpeakerMap({ ...langSpeakerMap });
    }, [resourceManagerState.speakersInOpenTTS, resourceManagerState.speakersInVoiceVox]);

    const serverUrlRow = useMemo(() => {
        const cliecked = () => {
            const textInput = document.getElementById("sidebar-voicevox-url-text") as HTMLInputElement
            applicationSettingState.setVoiceVoxUrl(textInput.value)
        }
        return (
            <div className="sidebar-content-row-3-5-2">
                <div className="sidebar-content-row-label">server url</div>
                <div className="sidebar-content-row-input">
                    <input type="text" className="sidebar-content-row-input-input" id="sidebar-voicevox-url-text" defaultValue={applicationSettingState.applicationSetting.voicevox_setting.voicevox_url} />
                </div>
                <div className="sidebar-content-row-label">
                    <div
                        className="sidebar-content-row-button"
                        onClick={cliecked}
                    >
                        set
                    </div>

                </div>
            </div>
        )
    }, [])

    const speakerRow = useMemo(() => {
        const keys = Object.keys(localLangSpeakerMap).sort((a, b) => {
            return a < b ? -1 : 1;
        });
        const langSelector = (
            <select
                id="sidebar-lang-selector"
                className="sidebar-content-row-select-select"
                onChange={(ev) => {
                    applicationSettingState.setVoiceVoxLang(ev.target.value)
                }}
                value={voiceSetting.voice_lang}
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

        const speakerSelector = localLangSpeakerMap[voiceSetting.voice_lang] ? (
            <select
                id="sidebar-speaker-selector"
                className="sidebar-content-row-select-select"
                onChange={(ev) => {
                    applicationSettingState.setVoiceVoxSpeaker(ev.target.value)
                }}
                value={voiceSetting.voice_speaker}
            >
                {localLangSpeakerMap[voiceSetting.voice_lang].map((x) => {
                    return (
                        <option key={x} value={x}>
                            {x}
                        </option>
                    );
                })}
            </select>)
            :
            (<></>);

        return (
            <div className="sidebar-content-row-3-2-5">

                <div className="sidebar-content-row-label">speaker</div>
                <div className="sidebar-content-row-select">{langSelector}</div>
                <div className="sidebar-content-row-select">{speakerSelector}</div>
            </div>
        )
    }, [localLangSpeakerMap, voiceSetting.voice_lang, voiceSetting.voice_speaker])

    const textInputRow = useMemo(() => {
        const speakClicked = async () => {
            const text = document.getElementById("sidebar-voicevox-speak-text") as HTMLInputElement;
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
        return (
            <div className="sidebar-content-row-3-5-2">
                <div className="sidebar-content-row-label">text</div>
                <div className="sidebar-content-row-input">
                    <input type="text" className="sidebar-content-row-input-input" id="sidebar-voicevox-speak-text" />
                </div>
                <div className="sidebar-content-row-label">
                    <div
                        className="sidebar-content-row-button"
                        onClick={() => {
                            speakClicked();
                        }}
                    >
                        speak
                    </div>
                </div>
            </div>
        )
    }, [resourceManagerState.speakersInVoiceVox, resourceManagerState.speakersInOpenTTS])

    const echoButtonRow = useMemo(() => {
        return (
            <div className="sidebar-content-row-7-3">
                <div className="sidebar-zoom-area-input-label"></div>
                <div className="sidebar-content-row-label">
                    <input
                        id="capture-checkbox"
                        className="sidebar-content-row-input-checkbox"
                        type="checkbox"
                        defaultChecked={echoBack}
                        onChange={(ev) => {
                            setEchoback(ev.target.checked);
                        }}
                    />
                    : echo
                </div>
            </div>

        )
    }, [resourceManagerState.speakersInVoiceVox, resourceManagerState.speakersInOpenTTS])


    //// (3-3)

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

    const recognitionRow = useMemo(() => {

        const selector = (
            <select
                id="sidebar-lang-selector"
                className="sidebar-content-row-select-select"
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

        const buttonLabel = isRecognitionEnableSync ? "stop" : "start"
        const buttonClass = isRecognitionEnableSync ? "sidebar-content-row-button-activated" : "sidebar-content-row-button-stanby"

        return (
            <>
                <div className="sidebar-content-row-3-5-2">
                    <div className="sidebar-content-row-label">recognition</div>
                    <div className="sidebar-content-row-label">
                        {selector}
                    </div>
                    <div className={buttonClass} onClick={() => {
                        if (isRecognitionEnableSync == isRecognitionEnabledRef.current) {
                            recognitionClicked();
                        }
                    }}>
                        {buttonLabel}
                    </div>
                </div>
            </>
        )

    }, [languageKey, isRecognitionEnableSync])



    const audioOutputRow = useMemo(() => {
        return (
            <div className="sidebar-content-row-3-7">
                <div className="sidebar-content-row-label">echoback:</div>
                <div className="sidebar-content-row-select">
                    <DeviceSelector deviceType={"audiooutput"}></DeviceSelector>
                </div>
            </div>
        );
    }, []);

    //////////////////
    // Rendering   ///
    //////////////////
    return (
        <>
            <div className="sidebar-content">
                {serverUrlRow}
                {speakerRow}
                {textInputRow}
                {echoButtonRow}
                {audioOutputRow}
                {recognitionRow}
                <audio id="sidebar-generate-voice-player"></audio>
            </div>
        </>
    );
};
