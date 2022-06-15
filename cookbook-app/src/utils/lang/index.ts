import * as _ from "lodash"

/**
 * @param from The object to recursively clone
 * @return a deep clone of passed _object_
 */
export function clone(from: object): object {
    return _.cloneDeep(from)
}

/**
 * @param o object to compare
 * @param o1 other object to compare
 * @return true if the objects are equivalent, otherwise false.
 */
export function equals(o: object, o1: object): boolean {
    return _.isEqual(o, o1)
}

/**
 * @param v value to check
 * @return true if value is empty, otherwise false.
 */
export function isEmpty(v: any): boolean {
    return _.isEmpty(v)
}

/**
 * @param v value to check
 * @return true if value is a boolean, otherwise false.
 */
export function isBoolean(v: any): boolean {
    return typeof v === "boolean"
}

/**
 * @param v value to check
 * @return true if value is a string, otherwise false.
 */
export function isString(v: any): boolean {
    return typeof v === "string"
}

/**
 * @param v value to check
 * @return true if value is a number, otherwise false.
 */
export function isNumber(v: any): boolean {
    return typeof v === "number"
}

/**
 * @param v value to check
 * @return true if value is a function, otherwise false.
 */
export function isCallable(v: any): boolean {
    return typeof v === "function"
}

/**
 * @param v value to check
 * @return true if value is defined, otherwise false.
 */
export function isDefined(v: any): boolean {
    return typeof v !== "undefined"
}

/**
 * @param timestamp date in milliseconds
 * @param lang language whose formatting conventions
 * @param seconds (optional) if true, return string has also the seconds, otherwise no.
 * @return a string representing the given date (_timestamp_) according to language-specific conventions.
 */
export function dateFormat(timestamp: number, lang = "it", seconds?: boolean): string {
    return new Date(timestamp).toLocaleString([lang], {
        year: "numeric",
        day: "2-digit",
        month:"2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: seconds ? "2-digit":  undefined
    })
}
