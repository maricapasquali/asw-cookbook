/* -- EXPORTED FUNCTIONALITY -- */
export const tryAgainSeconds = 30

export const maxNumberAttempt = 4

export const ip1 = "::1"

export function tryAgainAfter(): number {
    return Math.round(tryAgainSeconds + Math.random())
}
