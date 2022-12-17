import React, { useState } from "react";
import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAppState } from "../003_provider/003_AppStateProvider";
import { useFileInput } from "./hooks/useFileInput";

const TabItems = {
    audioInput: "audioInput",
    videoInput: "videoInput",
    audioOutput: "audioOutput",
    avatar: "avatar",
} as const;
type TabItems = typeof TabItems[keyof typeof TabItems];

type DialogTileIconProps = {
    tabId: TabItems;
    onChange: (tabId: TabItems) => void;
    selected: boolean;
    icon: JSX.Element;
    label: string;
};

const DialogTileIcon = (props: DialogTileIconProps) => {
    const icon = useMemo(() => {
        return (
            <div className="dialog-tile-icon-container">
                <input
                    id={props.tabId}
                    className="dialog-radio-button"
                    type="radio"
                    name="setting-dialog"
                    onChange={() => {
                        props.onChange(props.tabId);
                    }}
                    checked={props.selected}
                />
                <div className="dialog-radio-tile">
                    {props.icon}
                    <label htmlFor={props.tabId} className="dialog-radio-tile-label">
                        {props.label}
                    </label>
                </div>
            </div>
        );
    }, [props.selected]);
    return icon;
};

type DialogTilesProps = {
    currentTab: TabItems;
    onChange: (tabId: TabItems) => void;
};

const DialogTiles = (props: DialogTilesProps) => {
    const tiles = useMemo(() => {
        const audioInputIconProps: DialogTileIconProps = {
            tabId: TabItems.audioInput,
            onChange: () => {
                props.onChange(TabItems.audioInput);
            },
            selected: props.currentTab == TabItems.audioInput,
            icon: <FontAwesomeIcon icon={["fas", "microphone"]} size="3x" />,
            label: "microphone",
        };
        const audioInputIcon = <DialogTileIcon {...audioInputIconProps}></DialogTileIcon>;

        const videoInputIconProps: DialogTileIconProps = {
            tabId: TabItems.videoInput,
            onChange: () => {
                props.onChange(TabItems.videoInput);
            },
            selected: props.currentTab == TabItems.videoInput,
            icon: <FontAwesomeIcon icon={["fas", "video"]} size="3x" />,
            label: "camera",
        };
        const videoInputIcon = <DialogTileIcon {...videoInputIconProps}></DialogTileIcon>;

        const audioOutputIconProps: DialogTileIconProps = {
            tabId: TabItems.audioOutput,
            onChange: () => {
                props.onChange(TabItems.audioOutput);
            },
            selected: props.currentTab == TabItems.audioOutput,
            icon: <FontAwesomeIcon icon={["fas", "volume-high"]} size="3x" />,
            label: "speaker",
        };
        const audioOutputIcon = <DialogTileIcon {...audioOutputIconProps}></DialogTileIcon>;

        const avatarIconProps: DialogTileIconProps = {
            tabId: TabItems.avatar,
            onChange: () => {
                props.onChange(TabItems.avatar);
            },
            selected: props.currentTab == TabItems.avatar,
            icon: <FontAwesomeIcon icon={["fas", "user-tie"]} size="3x" />,
            label: "avatar",
        };
        const avatarIcon = <DialogTileIcon {...avatarIconProps}></DialogTileIcon>;
        const tiles = (
            <div className="dialog-radio-tile-group">
                {audioInputIcon}
                {videoInputIcon}
                {audioOutputIcon}
                {avatarIcon}
            </div>
        );
        return tiles;
    }, [props.currentTab]);
    return tiles;
};

export const SettingDialog = () => {
    const { deviceManagerState, frontendManagerState, browserProxyState, threeState } = useAppState();
    // (1) States

    const [tab, setTab] = useState<TabItems>("audioInput");
    const [showFileInputForVideo, setShowFileInputForVideo] = useState<boolean>(false);
    const fileInputState = useFileInput();
    const close = () => {
        frontendManagerState.stateControls.settingDialogCheckbox.updateState(false);
    };
    ////////////////////////////
    //  Conponents
    ////////////////////////////
    // (2) input field
    //// (2-1) Tiles
    const dialogTilesProps: DialogTilesProps = {
        currentTab: tab,
        onChange: (tabId: TabItems) => {
            setTab(tabId);
        },
    };
    const dialogTiles = <DialogTiles {...dialogTilesProps}></DialogTiles>;

    //// (2-2) Description
    const description = useMemo(() => {
        switch (tab) {
            case "audioInput":
                return "Audio input setting";
            case "videoInput":
                return "Video input setting";
            case "audioOutput":
                return "Audio output setting";
            case "avatar":
                return "Avatar setting";
            default:
                console.error("unknwon state", tab);
                return "Unknown state";
        }
    }, [tab]);

    //// (2-2) Audio Input
    const audioInputOptions = useMemo(() => {
        const options = deviceManagerState.audioInputDevices.map((x) => {
            return (
                <option value={x.deviceId} key={x.deviceId}>
                    {x.label}
                </option>
            );
        });
        return options;
    }, [deviceManagerState.audioInputDevices]);
    const audioInputSelectField = useMemo(() => {
        // see: https://nessssy.net/blog/2021/01/08/react-select-defaultvalue
        if (deviceManagerState.audioInputDevices.length == 0) {
            return <></>;
        }
        if (tab != "audioInput") {
            return <></>;
        }
        return (
            <div className="dialog-input-controls">
                <div className="dialog-input-description-label">audio device</div>
                <select
                    id="setting-dialog-audio-input-select"
                    className="dialog-input-select"
                    required
                    defaultValue={browserProxyState.audioInputDeviceId || "none"}
                    onChange={(e) => {
                        if (e.target.value == "none") {
                            browserProxyState.setAudioInputDeviceId(null);
                        } else {
                            browserProxyState.setAudioInputDeviceId(e.target.value);
                        }
                    }}
                >
                    {audioInputOptions}
                </select>
            </div>
        );
    }, [deviceManagerState.audioInputDevices, tab]);
    const audioConnect = useMemo(() => {
        console.log("dialog-enable", browserProxyState.audioInputEnabled);
        if (tab != "audioInput") {
            return <></>;
        }
        return (
            <div className="dialog-input-controls">
                <div className="dialog-input-description-label">connect</div>
                <input
                    id="dialog-input-connect-audio-toggle"
                    className="dialog-input-toggle"
                    type="checkbox"
                    onClick={(e) => {
                        browserProxyState.setAudioInputEnabled(e.currentTarget.checked);
                    }}
                />
                <label htmlFor="dialog-input-connect-audio-toggle" className="dialog-input-toggle-label" />
            </div>
        );
    }, [browserProxyState.audioInputEnabled, tab]);

    //// (2-2) Video Input
    const videoInputOptions = useMemo(() => {
        const options = deviceManagerState.videoInputDevices.map((x) => {
            return (
                <option value={x.deviceId} key={x.deviceId}>
                    {x.label}
                </option>
            );
        });
        options.push(
            <option value="file" key="file">
                file
            </option>
        );
        return options;
    }, [deviceManagerState.videoInputDevices]);

    const videoInputSelectField = useMemo(() => {
        // see: https://nessssy.net/blog/2021/01/08/react-select-defaultvalue
        if (deviceManagerState.videoInputDevices.length == 0) {
            return <></>;
        }
        if (tab != "videoInput") {
            return <></>;
        }

        return (
            <>
                <div className="dialog-input-controls">
                    <div className="dialog-input-description-label">video device</div>

                    <select
                        id="setting-dialog-video-input-select"
                        className="dialog-input-select"
                        required
                        defaultValue={deviceManagerState.videoInputDeviceId || "none"}
                        onChange={(e) => {
                            if (e.target.value == "none") {
                                deviceManagerState.setVideoInputDeviceId(null);
                                setShowFileInputForVideo(false);
                            } else if (e.target.value == "file") {
                                deviceManagerState.setVideoInputDeviceId(null);
                                setShowFileInputForVideo(true);
                            } else {
                                deviceManagerState.setVideoInputDeviceId(e.target.value);
                                setShowFileInputForVideo(false);
                            }
                        }}
                    >
                        {videoInputOptions}
                    </select>
                </div>
            </>
        );
    }, [deviceManagerState.videoInputDevices, tab]);
    const fileInputButtonForVideo = useMemo(() => {
        if (!showFileInputForVideo || tab != "videoInput") {
            return <></>;
        }
        // const url = await fileInputState.click("audio.*|video.*");
        return (
            <div className="dialog-input-controls">
                <div className="dialog-input-description-label">Load Movie File</div>
                <div
                    className="dialog-input-normal-button"
                    onClick={() => {
                        const loadFile = async () => {
                            const url = await fileInputState.click("audio.*|video.*");
                            deviceManagerState.setVideoFileURL(url);
                        };
                        loadFile();
                    }}
                >
                    load file
                </div>
            </div>
        );
    }, [showFileInputForVideo, tab]);

    //// (2-2) Audio Output
    const audioOutputOptions = useMemo(() => {
        const options = deviceManagerState.audioOutputDevices.map((x) => {
            return (
                <option value={x.deviceId} key={x.deviceId}>
                    {x.label}
                </option>
            );
        });
        return options;
    }, [deviceManagerState.audioInputDevices]);
    const audioOutputSelectField = useMemo(() => {
        // see: https://nessssy.net/blog/2021/01/08/react-select-defaultvalue
        if (deviceManagerState.audioOutputDevices.length == 0) {
            return <></>;
        }
        if (tab != "audioOutput") {
            return <></>;
        }
        return (
            <div className="dialog-input-controls">
                <div className="dialog-input-description-label">speaker for echoback</div>
                <select
                    id="setting-dialog-audio-input-select"
                    className="dialog-input-select"
                    required
                    defaultValue={deviceManagerState.audioOutputDeviceId || "none"}
                    onChange={(e) => {
                        if (e.target.value == "none") {
                            deviceManagerState.setAudioOutputDeviceId(null);
                        } else {
                            deviceManagerState.setAudioOutputDeviceId(e.target.value);
                        }
                    }}
                >
                    {audioOutputOptions}
                </select>
            </div>
        );
    }, [deviceManagerState.audioOutputDevices, tab]);

    //// (2-3) Avatar Input
    const fileButtonForAvatar = useMemo(() => {
        if (tab != "avatar") {
            return <></>;
        }
        return (
            <div className="dialog-input-controls">
                {/* <div className="setting-dialog-normal-button-container"> */}
                <div className="dialog-input-description-label">Load VRM</div>

                <div
                    className="dialog-input-normal-button"
                    onClick={() => {
                        const loadFile = async () => {
                            const url = await fileInputState.click("");
                            await threeState.loadAvatar(url);
                        };
                        loadFile();
                    }}
                >
                    load file
                </div>
                {/* </div> */}
            </div>
        );
    }, [tab, threeState.character]);
    const fileButtonForAvatarMotion = useMemo(() => {
        if (tab != "avatar") {
            return <></>;
        }
        return (
            <div className="dialog-input-controls">
                <div className="setting-dialog-normal-button-container">
                    <div className="setting-dialog-normal-button-label">Load Avatar Motion File</div>

                    <div
                        className="setting-dialog-normal-button"
                        onClick={() => {
                            const loadFile = async () => {
                                const url = await fileInputState.click("");
                                await threeState.loadAvatar(url);
                            };
                            loadFile();
                        }}
                    >
                        load file
                    </div>
                </div>
            </div>
        );
    }, [tab]);

    const buttons = useMemo(() => {
        return (
            <div className="dialog-input-submit-buttons-container">
                <div id="submit" className="dialog-input-submit-button" onClick={close}>
                    close
                </div>
            </div>
        );
    }, [tab]);

    const form = useMemo(() => {
        return (
            <div className="dialog-frame">
                <div className="dialog-title">Setting</div>
                <div className="dialog-content">
                    <div className={"dialog-application-title"}></div>
                    {dialogTiles}

                    <div className="dialog-description">{description}</div>
                    <form>
                        <div className="dialog-input-container">
                            {audioInputSelectField}
                            {audioConnect}
                            {videoInputSelectField}
                            {fileInputButtonForVideo}
                            {audioOutputSelectField}
                            {fileButtonForAvatar}
                            {/* {fileButtonForAvatarMotion} */}
                            {buttons}
                        </div>
                    </form>
                </div>
            </div>
        );
    }, [tab, audioInputSelectField, videoInputSelectField, fileInputButtonForVideo, audioOutputSelectField, fileButtonForAvatar, fileButtonForAvatarMotion]);

    return form;
};
