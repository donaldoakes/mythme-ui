export interface DateFormatOptions {
  friendly?: boolean
  withTime?: boolean
  withMs?: boolean
}

export const useDateTime = () => {
  return {
    formatDate(date?: Date, options?: DateFormatOptions): string {
      if (!date) return ''
      if (options?.friendly) {
        const now = new Date()
        if (
          date.getDate() === now.getDate() &&
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        ) {
          return 'Today'
        }
      }
      return date.toLocaleDateString()
    },
    formatTime(date?: Date, options?: DateFormatOptions): string {
      if (!date) return ''
      if (options?.withMs) {
        const mins = date.getMinutes().toString().padStart(2, '0')
        const secs = date.getSeconds().toString().padStart(2, '0')
        const ms = date.getMilliseconds().toString().padStart(3, '0')
        return `${date.getHours()}:${mins}:${secs}:${ms}`
      } else {
        return date.toLocaleTimeString()
      }
    },
    format(date?: Date, options?: DateFormatOptions): string {
      if (!date) return ''
      let dt = this.formatDate(date, options)
      if (!(options?.withTime === false)) {
        dt += ' ' + this.formatTime(date)
      }
      return dt
    },
    duration(start: Date, end: Date): string {
      const diff = end.getTime() - start.getTime()
      const hours = Math.floor(diff / 1000 / 60 / 60)
      const mins = `${Math.floor((diff / 1000 / 60) % 60)}`.padStart(2, '0')
      return `${hours}:${mins}`
    }
  }
}
