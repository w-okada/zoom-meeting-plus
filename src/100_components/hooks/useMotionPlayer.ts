import { useEffect, useState } from "react"
import { useAppState } from "../../003_provider/AppStateProvider"

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import motionsCatalog from "../../motions.json";

export type Motion = {
    name: string,
    motion: any[]
}

export type MotionPlayerStateAndMethod = {
    motions: Motion[]
}

export const useMotionPlayer = (): MotionPlayerStateAndMethod => {
    const { resourceManagerState } = useAppState()
    const [motions, setMotions] = useState<Motion[]>([])
    useEffect(() => {
        const loadMotions = async () => {
            const motionsT = motionsCatalog as string[]
            for (const x of motionsT) {
                const motion = await resourceManagerState.fetchMotion(x)
                console.log(x, motion)
                const m: Motion = {
                    name: x,
                    motion: motion
                }
                motions.push(m)
            }
            setMotions([...motions])
        }
        loadMotions()
    }, [])

    const retVal: MotionPlayerStateAndMethod = {
        motions
    }
    return retVal

}