import type { Channel } from './channel'
import type { ScheduledRecording } from './recording'

export const programTypes = ['movie', 'series', 'sports', 'tvshow'] as const
export type ProgramType = (typeof programTypes)[number]

export interface Program {
  channel: Channel
  title: string
  subtitle?: string
  start: Date
  end: Date
  description?: string
  type?: ProgramType
  category?: string
  year?: number
  /**
   *  rating: 0 to 5 (mythtv stars has eighths)
   */
  rating: number
  season?: number
  episode?: number
  aired?: Date
  recording?: ScheduledRecording
}

export type Role =
  | 'director'
  | 'actor'
  | 'presenter'
  | 'producer'
  | 'guest'
  | 'guest_star'
  | 'writer'

export interface Credit {
  name: string
  role: Role
}
