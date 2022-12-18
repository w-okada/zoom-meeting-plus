
type VoicePlayerWorkletProps = {
    deltaSize: number,
    crossFadeOffsetRate: number,
    crossFadeEndRate: number,
    crossFadeLowerValue: number,
    crossFadeType: number
}
export class VoicePlayerWorkletNode extends AudioWorkletNode {
    constructor(context: AudioContext) {
        super(context, "voice-player-worklet-processor");
        this.port.onmessage = this.handleMessage_.bind(this);
        console.log("[Node:constructor] created.");
    }

    handleMessage_(event: any) {
        console.log(`[Node:handleMessage_] ` + `${event.data.message} (${event.data.contextTimestamp})`);
    }
    postReceivedVoice = (data: ArrayBuffer) => {
        this.port.postMessage({
            data: data,
        }, [data]);
    }

    notifyChangeProps = (props: VoicePlayerWorkletProps) => {
        this.port.postMessage(props);
    }

}