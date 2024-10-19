export interface RecordingType {
  number: number
  name: string
  description: string
}

export const recordingTypes: { [key: number]: RecordingType } = {
  0: { number: 0, name: "Don't Record", description: 'Do not record' },
  1: { number: 1, name: 'Record This', description: 'Record this showing' },
  2: { number: 2, name: 'Record Daily', description: 'Record one showing every day' },
  4: { number: 4, name: 'Record All', description: 'Record all showings' },
  5: { number: 5, name: 'Record Weekly', description: 'Record one showing every week' },
  6: { number: 6, name: 'Record One', description: 'Record one showing' },
  7: {
    number: 7,
    name: 'Override Record',
    description: 'Record this showing with override priority'
  },
  8: { number: 8, name: 'Record Error', description: 'Recording error' }
}

export interface ScheduledRecording {
  id: number
  type: number
  channel_id: number
  start: Date
  status: string
}
