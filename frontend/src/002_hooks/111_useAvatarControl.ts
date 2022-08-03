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
    smaWinSize: number
}
export type AvatarControlStateAndMethod = AvatarControlState & {
    useBodyRig: (val: boolean) => void
    setSmaWinSize: (val: number) => void
}


export const useAvatarControl = (props: UseAvatarControlProps): AvatarControlStateAndMethod => {
    const [isInitialized, setIsInitialzed] = useState<boolean>(false)
    const [smaWinSize, setSmaWinSize] = useState<number>(1)
    const detector = useMemo(() => {
        const d = new MotionDetector();

        return d
    }, [])
    useEffect(() => {
        const initlizeMotionDetector = async () => {
            await detector.initialize();
            await detector.setEnableFullbodyCapture(false);
            await detector.initializeManagers();
            // detector.setMovingAverageWindow(smaWinSize)
        }
        initlizeMotionDetector()
    }, [])

    useEffect(() => {
        detector.setMovingAverageWindow(smaWinSize)
    }, [smaWinSize])

    const avatar = useMemo(() => {
        const avatar = new MediapipeAvator()
        avatar.enableUpperBody = true
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
        // avatar.enableUpperBody = val;
    }
    const retVal: AvatarControlStateAndMethod = {
        detector,
        avatar,
        isInitialized,
        smaWinSize,
        useBodyRig,
        setSmaWinSize
    }
    return retVal
}