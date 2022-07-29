import { ZoomMtg } from "@zoomus/websdk";

declare global {
    interface Window {
        ZoomMtg: ZoomMtg
    }
}