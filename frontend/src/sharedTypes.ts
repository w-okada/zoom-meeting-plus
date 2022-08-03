
export type ZoomMeetingPlusInitEvent = {
    type: "ZoomMeetingPlusInitEvent",
}

export type ZoomMeetingPlusJoinEvent = {
    type: "ZoomMeetingPlusJoinEvent",
    data: {
        username: string, meetingNumber: string, password: string, signature: string, sdkKey: string
    }
}