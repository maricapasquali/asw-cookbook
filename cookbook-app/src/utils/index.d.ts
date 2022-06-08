import { Validator, PasswordValidatorExtended } from 'cookbook-shared/libs/validator'
import { ReaderStream } from "./filesystem";
import { VisitOptions } from "./arrays"
import { Scrolling } from "./window/scrolling";

declare global {
    interface Window {

        //Utils window

        scrolling: Scrolling

        // Utils Lang

        clone(from: object): object

        equals(o: object, o1: object): boolean

        isEmpty(v: any): boolean

        isBoolean(v: any): boolean

        isString(v: any): boolean

        isCallable(v: any): boolean

        isDefined(v: any): boolean

        dateFormat(timestamp: number, lang: string, seconds?: boolean): string

        // Utils Arrays

        diff(v1: Array<any>, v2: Array<any>): Array<any>

        pushIfAbsent(v1: Array<any>, val: any, predicate?: (v: any) => boolean): boolean

        prependIfAbsent(v1: Array<any>, val: any, predicate?: (v: any) => boolean | any): boolean

        removeIfPresent(v1: Array<any>, predicate: (v: any) => boolean | any): any

        replaceIfPresent(v1: Array<any>, predicate: (v: any) => boolean | any, newVal: any): any

        moveInFirstPosition(v1: Array<any>, predicate: (v: any) => boolean | any): void

        prepend(v1: Array<any>, index: number): void

        lastOf(v1: Array<any>, filter?: (v: any) => boolean | any): any

        flatten(vector: Array<object>, field: string): Array<object>

        visitUntil(vector: Array<object>, child: object, options: VisitOptions): Array<object>

        //Utils Filesystem

        ReaderStreamImage: ReaderStream

        ReaderStreamVideo: ReaderStream

        //Utils String Validator

        EmailValidator: Validator<string>

        PasswordValidator: PasswordValidatorExtended

    }
}