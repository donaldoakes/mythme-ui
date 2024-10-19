export type IconShade = 'light' | 'dark' | 'white' | 'gray'

export interface ChannelIcon {
  file: string
  shade?: IconShade
}

export interface Channel {
  id: number
  number: number
  callsign: string
  name: string
  icon?: ChannelIcon
}
