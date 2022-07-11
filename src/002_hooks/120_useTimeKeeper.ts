import { useEffect, useState } from "react"

export type TimeKeeperProps = {
    enable: boolean,
    endTime: string,
    oneMinuteEnable: boolean,
    threeMinutesEnable: boolean,
    fiveMinutesEnable: boolean,
}
export type TimeoutKeys = {
    timeout: NodeJS.Timeout | null
    oneMinuteTimeout: NodeJS.Timeout | null
    threeMinutesTimeout: NodeJS.Timeout | null
    fiveMinutesTimeout: NodeJS.Timeout | null
}
export const TimeKeeperEvent = {
    EndTime: "EndTime",
    OneMinute: "OneMinute",
    ThreeMinutes: "ThreeMinutes",
    FiveMinutes: "FiveMinutes",
    NoEvent: "NoEvent",

} as const
export type TimeKeeperEvent = typeof TimeKeeperEvent[keyof typeof TimeKeeperEvent]

export type TimeKeeperState = TimeKeeperProps & {
    timeKeeperEvent: TimeKeeperEvent | null
    enable: boolean
}
export type TimeKeeperStateAndMethod = TimeKeeperState & {
    setTimeKeeperProps: (val: TimeKeeperProps) => void
    calcRemainTime: (time: string) => number
    clearEvent: () => void
}


export const useTimeKeeper = (): TimeKeeperStateAndMethod => {
    const [timeKeeperProps, setTimeKeeperProps] = useState<TimeKeeperProps>(
        {
            enable: false,
            endTime: "",
            oneMinuteEnable: false,
            threeMinutesEnable: false,
            fiveMinutesEnable: false,
        }
    )
    const [timeoutKeys, setTimeoutKeys] = useState<TimeoutKeys>(
        {
            timeout: null,
            oneMinuteTimeout: null,
            threeMinutesTimeout: null,
            fiveMinutesTimeout: null,
        }
    )
    const [timeKeeperEvent, setTimeKeeperEvent] = useState<TimeKeeperEvent | null>(null)

    const calcRemainTime = (time: string) => {
        const current = new Date();
        const target = new Date();
        if (time.split(":").length == 2) {
            target.setHours(Number(time.split(":")[0]));
            target.setMinutes(Number(time.split(":")[1]));
            target.setSeconds(0);
            if (target.getTime() - current.getTime() < 0) {
                target.setDate(target.getDate() + 1);
            }
        }
        const endToGoMs = target.getTime() - current.getTime();
        return endToGoMs
    }
    useEffect(() => {
        if (!timeKeeperProps) {
            return
        }

        if (timeoutKeys.timeout) {
            clearTimeout(timeoutKeys.timeout)
        }
        if (timeoutKeys.oneMinuteTimeout) {
            clearTimeout(timeoutKeys.oneMinuteTimeout)
        }
        if (timeoutKeys.threeMinutesTimeout) {
            clearTimeout(timeoutKeys.threeMinutesTimeout)
        }
        if (timeoutKeys.fiveMinutesTimeout) {
            clearTimeout(timeoutKeys.fiveMinutesTimeout)
        }

        if (timeKeeperProps.enable) {
            const endToGoMs = calcRemainTime(timeKeeperProps.endTime);
            const oneMinuteToGoMs = endToGoMs - 60 * 1000;
            const threeMinutesToGoMs = endToGoMs - 180 * 1000;
            const fiveMinutesToGoMs = endToGoMs - 300 * 1000;

            const timeout = setTimeout(() => {
                setTimeKeeperEvent(TimeKeeperEvent.EndTime)
            }, endToGoMs)
            timeoutKeys.timeout = timeout
            if (oneMinuteToGoMs > 0) {
                const oneMinuteTimeout = setTimeout(() => {
                    setTimeKeeperEvent(TimeKeeperEvent.OneMinute)
                }, oneMinuteToGoMs)
                timeoutKeys.oneMinuteTimeout = oneMinuteTimeout
            }
            if (threeMinutesToGoMs > 0) {
                const threeMinutesTimeout = setTimeout(() => {
                    setTimeKeeperEvent(TimeKeeperEvent.ThreeMinutes)
                }, threeMinutesToGoMs)
                timeoutKeys.threeMinutesTimeout = threeMinutesTimeout
            }
            if (fiveMinutesToGoMs > 0) {
                const fiveMinutesTimeout = setTimeout(() => {
                    setTimeKeeperEvent(TimeKeeperEvent.FiveMinutes)
                }, fiveMinutesToGoMs)
                timeoutKeys.fiveMinutesTimeout = fiveMinutesTimeout
            }
            setTimeoutKeys({ ...timeoutKeys })
        }
    }, [timeKeeperProps])

    const clearEvent = () => {
        setTimeKeeperEvent(TimeKeeperEvent.NoEvent)
    }

    const returnVal: TimeKeeperStateAndMethod = {
        ...timeKeeperProps,
        timeKeeperEvent,
        setTimeKeeperProps,
        calcRemainTime,
        clearEvent,
    }

    return returnVal
}