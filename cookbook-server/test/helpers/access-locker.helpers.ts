/* -- EXPORTED FUNCTIONALITY -- */
export const tryAgainSeconds: number = 30

export const maxNumberAttempt: number = 4

export const ip1: string = '::1'

export const tryAgainAfter = (): number => Math.round(tryAgainSeconds + Math.random())
