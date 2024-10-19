import type { Env } from '../model/env'

const trim = (s: string): string => {
  return s.endsWith('/') ? s.slice(0, -1) : s
}

const env: Env = {
  uiBase: trim(import.meta.env.BASE_URL),
  iconsBase: trim(import.meta.env.VITE_MYTHME_ICONS_BASE),
  apiBase: trim(import.meta.env.VITE_MYTHME_API_BASE)
}

export const useEnv = (): Env => {
  return env
}
