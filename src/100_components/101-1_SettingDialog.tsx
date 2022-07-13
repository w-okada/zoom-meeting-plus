import React, { useState } from "react";
import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAppState } from "../003_provider/AppStateProvider";
import { useFileInput } from "./hooks/useFileInput";

const TabItems = {
    audioInput: "audioInput",
    videoInput: "videoInput",
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
    // Icons
    const dialogTilesProps: DialogTilesProps = {
        currentTab: tab,
        onChange: (tabId: TabItems) => {
            setTab(tabId);
        },
    };
    const dialogTiles = <DialogTiles {...dialogTilesProps}></DialogTiles>;

    // Input field
    const description = useMemo(() => {
        switch (tab) {
            case "audioInput":
                return "Audio input setting.";
            case "videoInput":
                return "Video input setting.";
            case "avatar":
                return "Avatar setting.";
            default:
                console.error("unknwon state", tab);
                return "Unknown state.";
        }
    }, [tab]);

    // () Audio Input
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
            <div className={`dialog-input-controls`}>
                <select
                    id="setting-dialog-audio-input-select"
                    className="select"
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
                <label htmlFor="">auido device</label>
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
                <div style={{ display: "flex", alignItems: "center" }}>
                    <input
                        className="checkbox"
                        type="checkbox"
                        id="setting-dialog-audio-input-connect"
                        defaultChecked={browserProxyState.audioInputEnabled}
                        onClick={(e) => {
                            browserProxyState.setAudioInputEnabled(e.currentTarget.checked);
                        }}
                    />
                    <label htmlFor="setting-dialog-audio-input-connect" className="time-keeper-trigger-label">
                        connect
                    </label>
                </div>
            </div>
        );
    }, [browserProxyState.audioInputEnabled, tab]);
    // () Video Input
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
                <div className={`dialog-input-controls`}>
                    <select
                        id="setting-dialog-video-input-select"
                        className="select"
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
                    <label htmlFor="">video device</label>
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
            <div className={`dialog-input-controls`}>
                <div
                    className="setting-dialog-normal-button"
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
    }, [showFileInputForVideo]);

    // () Avatar Input
    const fileButtonForAvatar = useMemo(() => {
        if (tab != "avatar") {
            return <></>;
        }
        return (
            <div className={`dialog-input-controls`}>
                <div className="setting-dialog-normal-button-container">
                    <div className="setting-dialog-normal-button-label">Load Avatar VRM File</div>

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
    const fileButtonForAvatarMotion = useMemo(() => {
        if (tab != "avatar") {
            return <></>;
        }
        return (
            <div className={`dialog-input-controls`}>
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
            <div className="dialog-input-controls">
                <div id="submit" className="submit-button" onClick={close}>
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
                            {fileButtonForAvatar}
                            {/* {fileButtonForAvatarMotion} */}
                            {buttons}
                        </div>
                    </form>
                </div>
            </div>
        );
    }, [tab, audioInputSelectField, videoInputSelectField, fileInputButtonForVideo, fileButtonForAvatar, fileButtonForAvatarMotion]);

    return form;
};
