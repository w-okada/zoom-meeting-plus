import { VoiceFocusDeviceTransformer, VoiceFocusTransformDevice } from "amazon-chime-sdk-js"
import MicrophoneStream from "microphone-stream"
import { MajarModeTypes, VoiceChangerMode } from "../001_clients_and_managers/000_ApplicationSettingLoader"
import { VoicePlayerWorkletNode } from "./001_VoicePlayerWorkletNode"
import { AudioStreamer } from "./002_AudioStreamer"
import { createDummyMediaStream } from "./999_Utils"

export class MMVCClient {
    audioContext: AudioContext
    micMediaStream: MediaStream | null = null
    micStream: MicrophoneStream
    voicePlayerNode: VoicePlayerWorkletNode
    audioStreamer: AudioStreamer
    outputNodeForMicStream: MediaStreamAudioDestinationNode | null = null // from VF to MicStream
    outputNode: MediaStreamAudioDestinationNode

    initializedFlag: Promise<void> | null = null
    voiceChangeFlag = false

    // For VF
    vfEnable = false
    vf: VoiceFocusDeviceTransformer | null = null
    currentDevice: VoiceFocusTransformDevice | null = null


    constructor(audioContext: AudioContext, vfEnable: boolean) {
        this.audioContext = audioContext
        this.vfEnable = vfEnable
        this.outputNode = audioContext.createMediaStreamDestination();
        if (this.vfEnable) {
            this.initializedFlag = new Promise<void>(async (resolve) => {
                this.vf = await VoiceFocusDeviceTransformer.create({ variant: 'c20' })
                const dummyMediaStream = createDummyMediaStream(audioContext)
                this.currentDevice = (await this.vf.createTransformDevice(dummyMediaStream)) || null;
                this.outputNodeForMicStream = audioContext.createMediaStreamDestination();
                resolve()
            })
        }
        this.micStream = new MicrophoneStream({
            objectMode: true,
            bufferSize: 1024,
            context: this.audioContext
        })

        this.voicePlayerNode = new VoicePlayerWorkletNode(audioContext);
        this.voicePlayerNode.connect(this.outputNode) // PlayerからOutputノードへ
        this.audioStreamer = this._createAudiaStreamer(this.voicePlayerNode) // AudioStreamerからPlayerへ

        this.micStream.pipe(this.audioStreamer) // MicStreamからAudioStreamerへ
    }
    _createAudiaStreamer = (voicePlayerNode: VoicePlayerWorkletNode) => {
        return new AudioStreamer("docker", "http://localhost:18888/test", (voiceChangerMode: VoiceChangerMode, data: ArrayBuffer) => {
            // 1chunk以下のデータが返ってきたときは何か問題が起こっている。
            if (data.byteLength < 512) {
                console.log("Invalid Response Recieved", data)
                // setReceivedDataStatus(ReceivedDataStatus.invalid)
                return
            } else {
                // setReceivedDataStatus(ReceivedDataStatus.good)
            }

            if (voiceChangerMode === "realtime") {
                voicePlayerNode.postReceivedVoice(data)
                return
            }

            // For Near Realtime Mode
            console.log("near realtime mode")

            const i16Data = new Int16Array(data)
            const f32Data = new Float32Array(i16Data.length)
            // https://stackoverflow.com/questions/35234551/javascript-converting-from-int16-to-float32
            i16Data.forEach((x, i) => {
                const float = (x >= 0x8000) ? -(0x10000 - x) / 0x8000 : x / 0x7FFF;
                f32Data[i] = float

            })

            const source = this.audioContext.createBufferSource();
            const buffer = this.audioContext.createBuffer(1, f32Data.length, 24000);
            buffer.getChannelData(0).set(f32Data);

            source.buffer = buffer;

            source.start();
            source.connect(this.outputNode)
        }, {
            notifyResponseTime: (_time: number) => {
                // responseTimesRef.current.push(time)
                // const avr = calcAverage(responseTimesRef.current)
                // setResponseTime(avr)
            },
            notifySendBufferingTime: (_time: number) => {
                // bufferingTimesRef.current.push(time)
                // const avr = calcAverage(bufferingTimesRef.current)
                // setBufferingTime(avr)
            },
        }, { objectMode: true, })

    }

    isInitialized = async () => {
        if (this.initializedFlag) {
            console.log("[MMVCClient] wait initializing....")
            await this.initializedFlag
            this.initializedFlag = null
            console.log("[MMVCClient] wait initializing.... done.")
        }
    }

    connect = async (mediaStream: MediaStream, forceVfDisable: boolean = false) => {
        if (this.initializedFlag) {
            console.log("[MMVCClient] wait initializing_1....")
            await this.initializedFlag
            this.initializedFlag = null
            console.log("[MMVCClient] wait initializing_1.... done.")
        }

        if (this.micMediaStream) {
            this.micMediaStream.getTracks().forEach(x => {
                x.stop()
            })
        }
        if (this.currentDevice && forceVfDisable == false) {
            this.currentDevice.chooseNewInnerDevice(mediaStream)
            const nodeToVF = this.audioContext.createMediaStreamSource(mediaStream); // マイクノード
            const voiceFocusNode = await this.currentDevice.createAudioNode(this.audioContext); // VFノード
            nodeToVF.connect(voiceFocusNode.start); // マイクからVFへ
            voiceFocusNode.end.connect(this.outputNodeForMicStream!); // VFから　MicStream用ノードへ
            this.micStream.setStream(this.outputNodeForMicStream!.stream) // MicStream用ノード(のMS)をMicStreamへ
            this.micStream.pauseRecording()
            this.voiceChangeFlag = false
        } else {
            this.micStream.setStream(mediaStream)
            this.micStream.pauseRecording()
            this.voiceChangeFlag = false
        }
        this.micMediaStream = mediaStream
    }
    getOutputMediaStream = () => {
        return this.outputNode.stream
    }

    // MicStream
    startRealtimeConvert = () => {
        this.micStream.playRecording()
        this.voiceChangeFlag = true
    }
    pauseRealtimeConvert = () => {
        this.micStream.pauseRecording()
        this.voiceChangeFlag = false
    }
    isRealtimeConverting = () => {
        return this.voiceChangeFlag
    }

    // AudioStreamer制御メソッドのラッパー
    setServerUrl = (serverUrl: string) => {
        this.audioStreamer.setServerUrl(serverUrl)
    }
    setMajarMode = (val: MajarModeTypes) => {
        this.audioStreamer.setMajarMode(val)
    }
    setSrcId = (id: number) => {
        this.audioStreamer.setSrcId(id)
    }
    setDstId = (id: number) => {
        this.audioStreamer.setDstId(id)
    }
    setGpu = (id: number) => {
        this.audioStreamer.setGpu(id)
    }
    setPrefixChunkSize = (size: number) => {
        this.audioStreamer.setPrefixChunkSize(size)
    }
    setChunkSize = (size: number) => {
        this.audioStreamer.setChunkSize(size)
    }
    setVoiceChangerMode = (val: VoiceChangerMode) => {
        this.audioStreamer.setVoiceChangerMode(val)
    }

    // VoicePlayerWorkletNodeのラッパー
    changeSetting = () => {
        this.voicePlayerNode.notifyChangeProps({
            deltaSize: 12,
            crossFadeOffsetRate: 0.2,
            crossFadeEndRate: 0.2,
            crossFadeLowerValue: 0.1,
            crossFadeType: 2
        })
    }


}