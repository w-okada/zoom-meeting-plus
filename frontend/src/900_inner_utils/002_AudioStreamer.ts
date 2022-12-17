import { io, Socket } from "socket.io-client";
import { DefaultEventsMap } from "@socket.io/component-emitter";
import { Duplex, DuplexOptions } from "readable-stream";
import { MajarModeTypes, VoiceChangerMode } from "../001_clients_and_managers/000_ApplicationSettingLoader";
import { postVoice } from "../001_clients_and_managers/009_ResourceLoader";



type AudioStreamerPerformanceListener = {
    notifySendBufferingTime: (time: number) => void
    notifyResponseTime: (time: number) => void
}

export class AudioStreamer extends Duplex {
    views: DataView[] = []
    socket!: Socket<DefaultEventsMap, DefaultEventsMap>
    srcId = 107
    dstId = 100
    gpu = 0
    prefixChunkSize = 64
    chunkSize = 64
    majarMode: MajarModeTypes = "docker"
    voiceChangerMode: VoiceChangerMode = "realtime"
    performanceListener: AudioStreamerPerformanceListener
    dataCallback: (voiceChangerMode: VoiceChangerMode, data: ArrayBuffer) => void
    requestWindow: ArrayBuffer[] = []

    serverUrl = ""
    transcribeTimingMonitor: number = 0

    constructor(majarMode: MajarModeTypes, serverUrl: string, callback: (voiceChangerMode: VoiceChangerMode, data: ArrayBuffer) => void, listener: AudioStreamerPerformanceListener, options?: DuplexOptions) {
        super(options);
        this.dataCallback = callback
        this.performanceListener = listener
        this.serverUrl = serverUrl
        this.majarMode = majarMode
        this.setVoiceChangerServerURL()
    }

    private setVoiceChangerServerURL = () => {
        console.log("New Connect Server:", this.serverUrl)
        if (this.socket) {
            this.socket.close()
        }
        if (this.majarMode === "docker") {
            this.socket = io(this.serverUrl);
            this.socket.on('connect', () => console.log('connect'));
            this.socket.on('response', (response: any[]) => {
                const cur = Date.now()
                const responseTime = cur - response[0]
                this.dataCallback(this.voiceChangerMode, response[1])
                this.performanceListener.notifyResponseTime(responseTime)
            });
        }
    }

    setServerUrl = (serverUrl: string) => {
        this.serverUrl = serverUrl
        this.setVoiceChangerServerURL()
    }
    setMajarMode = (val: MajarModeTypes) => {
        this.majarMode = val
        this.setVoiceChangerServerURL()
    }
    setSrcId = (id: number) => {
        this.srcId = id
    }
    setDstId = (id: number) => {
        this.dstId = id
    }
    setGpu = (id: number) => {
        this.gpu = id
    }
    setPrefixChunkSize = (size: number) => {
        this.prefixChunkSize = size
    }
    setChunkSize = (size: number) => {
        this.chunkSize = size
    }
    setVoiceChangerMode = (val: VoiceChangerMode) => {
        this.voiceChangerMode = val
    }

    private sendBuffer = async (newBuffer: Uint8Array) => {
        const timestamp = Date.now()
        // console.log("REQUEST_MESSAGE:", [this.gpu, this.srcId, this.dstId, timestamp, newBuffer.buffer])


        // console.log("SERVER_URL", this.serverUrl, this.majarMode)
        const prefixSize = this.voiceChangerMode === "realtime" ? this.prefixChunkSize : 0
        if (this.majarMode === "docker") {
            this.socket.emit('request_message', [this.gpu, this.srcId, this.dstId, timestamp, prefixSize, newBuffer.buffer]);
        } else {
            const res = await postVoice(this.serverUrl, this.gpu, this.srcId, this.dstId, timestamp, prefixSize, newBuffer.buffer)
            this.dataCallback(this.voiceChangerMode, res)
            this.performanceListener.notifyResponseTime(Date.now() - timestamp)
        }
    }

    _write = (chunk: AudioBuffer, _encoding: any, callback: any) => {
        const buffer = chunk.getChannelData(0);
        // console.log("SAMPLERATE:", chunk.sampleRate, chunk.numberOfChannels, chunk.length, buffer)
        if (this.voiceChangerMode === "realtime") {
            this._write_realtime(buffer)
        } else {
            this._write_record(buffer)
        }
        callback();
    }


    bufferStart = 0;
    deltaCount = 0


    private _write_realtime = (buffer: Float32Array) => {
        //// 1024個のデータ（48Khz）が入ってくる。
        // buffer(for48Khz)x16bit * chunksize / 2(for24Khz)


        //// 1024個のデータを間引いて512個にする。（24Khz）
        const arrayBuffer = new ArrayBuffer((buffer.length / 2) * 2)
        const dataView = new DataView(arrayBuffer);

        for (var i = 0; i < buffer.length; i++) {
            if (i % 2 == 0) {
                let s = Math.max(-1, Math.min(1, buffer[i]));
                s = s < 0 ? s * 0x8000 : s * 0x7FFF
                // ２分の１個目で２バイトずつ進むので((i/2)*2)
                dataView.setInt16((i / 2) * 2, s, true);
            }
        }

        //// 512個を一つのかたまりとしてリクエストバッファに追加
        this.requestWindow.push(arrayBuffer)


        //// リクエストバッファの中身が、リクエスト送信数と違う場合は処理終了。
        if (this.requestWindow.length < this.chunkSize) {
            return
        }

        // リクエスト用の入れ物を作成
        const windowByteLength = this.requestWindow.reduce((prev, cur) => {
            return prev + cur.byteLength
        }, 0)
        const newBuffer = new Uint8Array(windowByteLength);

        // リクエストのデータをセット
        this.requestWindow.reduce((prev, cur) => {
            newBuffer.set(new Uint8Array(cur), prev)
            return prev + cur.byteLength
        }, 0)

        this.sendBuffer(newBuffer)
        this.requestWindow = []

        this.performanceListener.notifySendBufferingTime(Date.now() - this.bufferStart)
        this.bufferStart = Date.now()
    }


    // Near Realtime用の蓄積処理
    recordBuffer: ArrayBuffer[] = []
    isRecording = false
    private _write_record = (buffer: Float32Array) => {
        if (!this.isRecording) { return }
        // buffer(for48Khz)x16bit * chunksize / 2(for24Khz)
        const sendBuffer = new ArrayBuffer(buffer.length * 2 / 2);
        const sendDataView = new DataView(sendBuffer);
        for (var i = 0; i < buffer.length; i++) {
            if (i % 2 == 0) {
                let s = Math.max(-1, Math.min(1, buffer[i]));
                s = s < 0 ? s * 0x8000 : s * 0x7FFF
                sendDataView.setInt16(i, s, true);
                // if (i % 3000 === 0) {
                //     console.log("buffer_converting", s, buffer[i])
                // }
            }
        }
        this.recordBuffer.push(sendBuffer)
    }

    // Near Realtime用のトリガ
    sendRecordedData = () => {
        const length = this.recordBuffer.reduce((prev, cur) => {
            return prev + cur.byteLength
        }, 0)
        const newBuffer = new Uint8Array(length);
        this.recordBuffer.reduce((prev, cur) => {
            newBuffer.set(new Uint8Array(cur), prev)
            return prev + cur.byteLength
        }, 0)

        this.sendBuffer(newBuffer)
    }
    clearRecordedData = () => {
        this.recordBuffer = []
    }
    startRecord = () => {
        this.isRecording = true
    }
    stopRecord = () => {
        this.isRecording = false
    }

}
