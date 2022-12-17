import { useEffect, useState } from "react";
import { useAppState } from "../../003_provider/003_AppStateProvider";


export const useTimeKeeperClient = () => {


    const { timeKeeperState, browserProxyState, resourceManagerState } = useAppState()
    const [last5Min, setLast5Min] = useState<ArrayBuffer | null>(null)
    const [last3Min, setLast3Min] = useState<ArrayBuffer | null>(null)
    const [last1Min, setLast1Min] = useState<ArrayBuffer | null>(null)
    const [endTime, setEndTime] = useState<ArrayBuffer | null>(null)
    useEffect(() => {
        const loadTimeKeeperVoice = async () => {
            const last5MinBlob = await resourceManagerState.fetchVoice(`${timeKeeperState.lang}/5minutes.mp3`)
            const last3MinBlob = await resourceManagerState.fetchVoice(`${timeKeeperState.lang}/3minutes.mp3`)
            const last1MinBlob = await resourceManagerState.fetchVoice(`${timeKeeperState.lang}/1minutes.mp3`)
            const endTimeBlob = await resourceManagerState.fetchVoice(`${timeKeeperState.lang}/endtime.mp3`)
            const last5Min = await last5MinBlob.arrayBuffer()
            const last3Min = await last3MinBlob.arrayBuffer()
            const last1Min = await last1MinBlob.arrayBuffer()
            const endTime = await endTimeBlob.arrayBuffer()

            setLast5Min(last5Min)
            setLast3Min(last3Min)
            setLast1Min(last1Min)
            setEndTime(endTime)
        }
        loadTimeKeeperVoice()
    }, [timeKeeperState.lang])

    useEffect(() => {
        if (!last5Min || !last3Min || !last1Min || !endTime) {
            return
        }
        console.log("TIMEKEEPER", timeKeeperState.timeKeeperEvent);
        if (timeKeeperState.timeKeeperEvent === "FiveMinutes") {
            browserProxyState.playAudio(last5Min.slice(0));
        } else if (timeKeeperState.timeKeeperEvent === "ThreeMinutes") {
            browserProxyState.playAudio(last3Min.slice(0));
        } else if (timeKeeperState.timeKeeperEvent === "OneMinute") {
            browserProxyState.playAudio(last1Min.slice(0));
        } else if (timeKeeperState.timeKeeperEvent === "EndTime") {
            browserProxyState.playAudio(endTime.slice(0));
        }
        timeKeeperState.clearEvent();
    }, [timeKeeperState.timeKeeperEvent]);


}