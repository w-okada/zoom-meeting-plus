import { MediapipeAvator } from "@dannadori/mediapipe-avatar-js";
import { MotionDetector } from "@dannadori/mediapipe-avatar-js";
import { VRM } from "@pixiv/three-vrm";
import { useMemo } from "react"

export type AvatarControlState = {
    detector: MotionDetector
    avatar: MediapipeAvator
}
export type AvatarControlStateAndMethod = AvatarControlState & {
    setAvatarVRM: (vrm: VRM, scene: THREE.Scene) => void
    useBodyRig: (val: boolean) => void
}


export const useAvatarControl = (): AvatarControlStateAndMethod => {
    const detector = useMemo(() => {
        const d = new MotionDetector();
        d.setEnableFullbodyCapture(false);
        d.initializeManagers();
        return d
    }, [])

    const avatar = useMemo(() => {
        const avatar = new MediapipeAvator()
        return avatar
    }, [])

    const setAvatarVRM = (vrm: VRM, scene: THREE.Scene) => {
        avatar.initialize(vrm, scene);
        // avatar.enableHands = false;
        // avatar.enableLegs = false;
        avatar.enableUpperBody = true;
    };

    const useBodyRig = (val: boolean) => {
        detector.setEnableFullbodyCapture(val);
        avatar.enableUpperBody = val;
    }
    const retVal: AvatarControlStateAndMethod = {
        detector,
        avatar,
        setAvatarVRM,
        useBodyRig

    }
    return retVal
}