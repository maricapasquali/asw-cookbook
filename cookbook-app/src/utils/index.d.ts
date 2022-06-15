import {
    PasswordValidatorExtended,
    Validator
} from "cookbook-shared/libs/validator"
import { ReaderStream } from "./filesystem"
import { VisitOptions } from "./arrays"
import { Scrolling } from "./window/scrolling"

declare global {
     interface Window {

        //Utils window

        scrolling: Scrolling

        // Utils Lang

        clone: (from: object) => object

        equals: (o: object, o1: object) => boolean

        isEmpty: (v: any) => boolean

        isBoolean: (v: any) => boolean

        isString: (v: any) => boolean

        isNumber: (v: any) => boolean

        isCallable: (v: any) => boolean

        isDefined: (v: any) => boolean

        dateFormat: (timestamp: number, lang: string, seconds?: boolean) => string

        // Utils Arrays

        diff: (v1: any[], v2: any[]) => any[]

        pushIfAbsent: (v1: any[], val: any, predicate?: (v: any) => boolean) => boolean

        prependIfAbsent: (v1: any[], val: any, predicate?: (v: any) => boolean | any) => boolean

        removeIfPresent: (v1: any[], predicate: (v: any) => boolean | any) => any

        replaceIfPresent: (v1: any[], predicate: (v: any) => boolean | any, newVal: any) => any

        moveInFirstPosition: (v1: any[], predicate: (v: any) => boolean | any) => void

        prepend: (v1: any[], index: number) => void

        lastOf: (v1: any[], filter?: (v: any) => boolean | any) => any

        flatten: (vector: object[], field: string) => object[]

        visitUntil: (vector: object[], child: object, options: VisitOptions) => object[]

        //Utils Filesystem

        ReaderStreamImage: ReaderStream

        ReaderStreamVideo: ReaderStream

        //Utils String Validator

        EmailValidator: Validator<string>

        PasswordValidator: PasswordValidatorExtended

    }
}
