import React, { useState } from "react";
import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAppState } from "../003_provider/AppStateProvider";

const TabItems = {
    audioInput: "audioInput",
    videoInput: "videoInput",
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

        const tiles = (
            <div className="dialog-radio-tile-group">
                {audioInputIcon}
                {videoInputIcon}
            </div>
        );
        return tiles;
    }, [props.currentTab]);
    return tiles;
};

export const SettingDialog = () => {
    const { deviceManagerState, frontendManagerState } = useAppState();
    // (1) States

    const [tab, setTab] = useState<TabItems>("audioInput");

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
                    defaultValue={deviceManagerState.audioInput}
                    onChange={(e) => {
                        deviceManagerState.setAudioInput(e.target.value);
                    }}
                >
                    {audioInputOptions}
                </select>
                <label htmlFor="">auido device</label>
            </div>
        );
    }, [deviceManagerState.audioInputDevices, tab]);

    // () Video Input
    const videoInputOptions = useMemo(() => {
        const options = deviceManagerState.videoInputDevices.map((x) => {
            return (
                <option value={x.deviceId} key={x.deviceId}>
                    {x.label}
                </option>
            );
        });
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
                        defaultValue={deviceManagerState.videoInput}
                        onChange={(e) => {
                            deviceManagerState.setVideoInput(e.target.value);
                        }}
                    >
                        {videoInputOptions}
                    </select>
                    <label htmlFor="">video device</label>
                </div>
            </>
        );
    }, [deviceManagerState.videoInputDevices, tab]);

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
                            {videoInputSelectField}
                            {buttons}
                        </div>
                    </form>
                </div>
            </div>
        );
    }, [tab, audioInputSelectField, videoInputSelectField]);

    return form;
};
