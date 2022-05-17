import {
    Validator,
    PasswordValidatorExtended,
    EmailValidator,
    PasswordValidator
} from 'cookbook-shared/libs/validator'
import {
    ReaderStream,
    ReaderStreamImage,
    ReaderStreamVideo
} from "./filesystem";
import {
    VisitOptions,
    diff,
    pushIfAbsent,
    prependIfAbsent,
    removeIfPresent,
    replaceIfPresent,
    prependIfPresent,
    prepend,
    lastOf,
    recursiveSearch,
    flatten,
    visitUntil,
} from "./arrays"
import {
    clone,
    equals,
    isEmpty,
    isBoolean,
    isString,
    isCallable,
    isDefined,
    dateFormat
} from "./lang"
import scrolling, {Scrolling} from "./lang/scrolling";

declare global {
    interface Window {
        clone(from: object): object

        equals(o: object, o1: object): boolean

        isEmpty(v: any): boolean

        isBoolean(v: any): boolean

        isString(v: any): boolean

        isCallable(v: any): boolean

        isDefined(v: any): boolean

        scrolling: Scrolling

        diff(v1: Array<any>, v2: Array<any>): Array<any>

        pushIfAbsent(v1: Array<any>, val: any, predicate?: (v: any) => boolean): boolean

        prependIfAbsent(v1: Array<any>, val: any, predicate?: (v: any) => boolean | any): boolean

        removeIfPresent(v1: Array<any>, predicate: (v: any) => boolean | any): any

        replaceIfPresent(v1: Array<any>, predicate: (v: any) => boolean | any, newVal: any): any

        prependIfPresent(v1: Array<any>, predicate: (v: any) => boolean | any): void

        prepend(v1: Array<any>, index: number): void

        lastOf(v1: Array<any>, filter?: (v: any) => boolean | any): any

        recursiveSearch(v1: Array<any>, v: any, field: string): any

        flatten(vector: Array<object>, field: string): Array<object>

        visitUntil(vector: Array<object>, child: object, options: VisitOptions): Array<object>

        dateFormat(timestamp: number, lang: string, seconds?: boolean): string

        ReaderStreamImage: ReaderStream,

        ReaderStreamVideo: ReaderStream,

        EmailValidator: Validator<string>,

        PasswordValidator: PasswordValidatorExtended,
    }
}

window.clone = clone
window.equals = equals
window.isEmpty = isEmpty
window.isBoolean = isBoolean
window.isString = isString
window.isCallable = isCallable
window.isDefined = isDefined
window.scrolling = scrolling

window.diff = diff
window.pushIfAbsent = pushIfAbsent
window.prependIfAbsent = prependIfAbsent
window.removeIfPresent = removeIfPresent
window.replaceIfPresent = replaceIfPresent
window.prependIfPresent = prependIfPresent
window.prepend = prepend
window.lastOf = lastOf
window.recursiveSearch = recursiveSearch
window.flatten = flatten
window.visitUntil = visitUntil

window.dateFormat = dateFormat

window.ReaderStreamImage = ReaderStreamImage
window.ReaderStreamVideo = ReaderStreamVideo

window.EmailValidator = EmailValidator
window.PasswordValidator = PasswordValidator
