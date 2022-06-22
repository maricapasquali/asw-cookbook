import * as crypto from "crypto"

/**
 * @param size length of the string to generate
 * @return a random string encoded __hex__ of length _size_
 */
export function randomString(size = 20): string {
    return crypto
        .randomBytes(size)
        .toString("hex")
        .slice(0, size)
}

/**
 * @param minutes time (expressed in minutes) to add to now
 * @return a future date (expressed in milliseconds) from now
 */
export function futureDateFromNow(minutes: number): number {
    return new Date(Date.now() + minutes * 60000).getTime()
}

export class NoArrayError extends Error {
    name = "NoArrayError"
    message = "It is not an array"
}
/**
 * Parse a JSON string to an array if it is an actual array.
 * @param encodedString JSON string to parse
 * @return an parsed array of _encodedString_
 * @throws {@link SyntaxError}
 * Throws a SyntaxError exception if the string to parse is not valid JSON.
 * @throws {@link NoArrayError}
 * Thrown if the parsed _encodedString_ is not array.
 */
export function decodeToArray(encodedString: string): any[] | never {
    const array = JSON.parse(encodedString)
    if (!Array.isArray(array)) throw new NoArrayError()
    return array
}

export class NoBooleanError extends Error {
    name = "NoBooleanError"
    message = "It is not a boolean"
}
/**
 * Parse a JSON string to a boolean if it is an actual boolean.
 * @param encodedString JSON string to check
 * @return true if _encodedString_ is instance of Boolean and is true, otherwise false.
 * @throws {@link SyntaxError}
 * Throws a SyntaxError exception if the string to parse is not valid JSON.
 * @throws {@link NoBooleanError}
 * Thrown if the parsed _encodedString_ is not boolean.
 */
export function decodeToBoolean(encodedString: string): boolean | never {
    const decoded = JSON.parse(encodedString)
    if (typeof decoded !== "boolean") throw new NoBooleanError()
    return decoded
}

type EnumValuesType = "string" | "number" | "boolean"
/**
 * @param enums enumeration from which to extract values
 * @param filterType type of values to filter
 * @return array of enumeration values
 */
export function valuesOfEnum(enums: Record<string, any>, filterType: EnumValuesType): any[] {
    return Object.values(enums).filter(value => typeof value === filterType)
}
