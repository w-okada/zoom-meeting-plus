import { MediapipeAvator } from "@dannadori/mediapipe-avatar-js";
import { MotionDetector } from "@dannadori/mediapipe-avatar-js";
import { VRM } from "@pixiv/three-vrm";
import { useEffect, useMemo, useState } from "react"
export type UseAvatarControlProps = {
    vrm: VRM | null,
    scene: THREE.Scene
}
export type AvatarControlState = {
    detector: MotionDetector
    avatar: MediapipeAvator
    isInitialized: boolean
}
export type AvatarControlStateAndMethod = AvatarControlState & {
    useBodyRig: (val: boolean) => void
}


export const useAvatarControl = (props: UseAvatarControlProps): AvatarControlStateAndMethod => {
    const [isInitialized, setIsInitialzed] = useState<boolean>(false)
    const detector = useMemo(() => {
        const d = new MotionDetector();
        d.setEnableFullbodyCapture(false);
        d.setMovingAverageWindow(10)
        d.initializeManagers();
        return d
    }, [])

    const avatar = useMemo(() => {
        const avatar = new MediapipeAvator()
        return avatar
    }, [])

    useEffect(() => {
        if (!props.vrm) {
            return
        }
        avatar.initialize(props.vrm, props.scene);
        // avatar.enableHands = false;
        // avatar.enableLegs = false;
        avatar.enableUpperBody = true;
        setIsInitialzed(true)
    }, [props.vrm, props.scene])


    const useBodyRig = (val: boolean) => {
        detector.setEnableFullbodyCapture(val);

        avatar.enableUpperBody = val;
    }
    const retVal: AvatarControlStateAndMethod = {
        detector,
        avatar,
        isInitialized,
        useBodyRig

    }
    return retVal
}