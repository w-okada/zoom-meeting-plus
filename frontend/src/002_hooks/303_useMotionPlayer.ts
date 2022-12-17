import { useEffect, useState } from "react"
import { useAppSetting } from "../003_provider/001_AppSettingProvider"
import { ResourceManagerStateAndMethod } from "./003_useResourceManager"

export type UseMotionPlayerProps = {
    resourceManagerState: ResourceManagerStateAndMethod

}
export type Motion = {
    name: string,
    motion: any[]
}
export type MotionPlayerState = {
    motions: Motion[]
}
export type MotionPlayerStateAndMethod = MotionPlayerState & {
    setMotion: (name: string, motion: any[]) => void
}

export const useMotionPlayer = (props: UseMotionPlayerProps): MotionPlayerStateAndMethod => {
    const { applicationSetting } = useAppSetting()
    const [motions, setMotions] = useState<Motion[]>([])
    useEffect(() => {
        const vrmMotions = applicationSetting!.vrm_motions
        console.log(applicationSetting)
        console.log(vrmMotions)
        const loadMotions = async () => {
            for (const m of vrmMotions) {
                const file = m.file
                const name = m.name
                try {
                    const motion = await props.resourceManagerState.fetchMotion(file)
                    console.log(name, motion)
                    const m: Motion = {
                        name: name,
                        motion: motion
                    }
                    motions.push(m)
                } catch (e) {
                    console.warn("useMotionPlayer", e)
                }
            }
            setMotions([...motions])
        }
        loadMotions()
    }, [])

    const setMotion = (name: string, motion: any[]) => {
        const m: Motion = {
            name,
            motion
        }
        setMotions([...motions, m])
    }

    const retVal: MotionPlayerStateAndMethod = {
        motions,
        setMotion
    }
    return retVal


}