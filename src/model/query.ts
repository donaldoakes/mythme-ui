import { programTypes } from './program'

export type FieldType = 'string' | 'number' | 'date'

export interface Field {
  name: string
  label: string
  type: FieldType
  options?: string[]
}

export const fields: Field[] = [
  { name: 'channel', label: 'Callsign', type: 'string', options: [] },
  { name: 'channum', label: 'Channel', type: 'number', options: [] },
  { name: 'start', label: 'Start', type: 'date' },
  { name: 'end', label: 'End', type: 'date' },
  { name: 'title', label: 'Title', type: 'string' },
  { name: 'type', label: 'Type', type: 'string', options: [...programTypes] },
  { name: 'category', label: 'Category', type: 'string', options: [] },
  { name: 'year', label: 'Year', type: 'number' },
  { name: 'rating', label: 'Rating', type: 'number' },
  { name: 'season', label: 'Season', type: 'number' },
  { name: 'episode', label: 'Episode', type: 'number' }
  // { name: 'genre', label: 'Genre', type: 'string', options: [] }
]

export const operators = ['=', '>', '<', '>=', '<=', '<>', 'IN', 'BETWEEN', 'LIKE'] as const
export type Operator = (typeof operators)[number]
export const allowableOperators: { [key in FieldType]: Operator[] } = {
  string: ['=', '<>', 'IN', 'LIKE'],
  number: ['=', '>', '<', '>=', '<=', '<>', 'IN', 'BETWEEN'],
  date: ['=', '>', '<', '>=', '<=', '<>', 'IN', 'BETWEEN']
}

export interface Criterion {
  field: Field
  operator: Operator
  value: string
}

export interface Query {
  name: string
  criteria: { [key: string]: Criterion }
}

export interface SavedQuery {
  name: string
  criteria: {
    name: string
    operator: Operator
    value: string
  }[]
}

export interface Page {
  start: number
  limit: number
}

export type Order = 'asc' | 'desc'

export interface Sort {
  name: string
  order?: Order
}
