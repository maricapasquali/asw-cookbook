require("@shared/libs/lang")
const { EmailValidator, PasswordValidator } = require("@shared/libs/validator")
const { ReaderStreamImage, ReaderStreamVideo } = require("./filesystem")
const {
    diff,
    pushIfAbsent,
    prependIfAbsent,
    removeIfPresent,
    replaceIfPresent,
    moveInFirstPosition,
    prepend,
    lastOf,
    flatten,
    visitUntil
} = require("./arrays")
const {
    clone,
    equals,
    isEmpty,
    isBoolean,
    isString,
    isNumber,
    isCallable,
    isDefined,
    dateFormat
} = require("./lang")
const { scrolling } = require("./window")

//Utils window
window.scrolling = scrolling

// Utils Lang
window.clone = clone
window.equals = equals
window.isEmpty = isEmpty
window.isBoolean = isBoolean
window.isString = isString
window.isNumber = isNumber
window.isCallable = isCallable
window.isDefined = isDefined
window.dateFormat = dateFormat

// Utils Arrays
window.diff = diff
window.pushIfAbsent = pushIfAbsent
window.prependIfAbsent = prependIfAbsent
window.removeIfPresent = removeIfPresent
window.replaceIfPresent = replaceIfPresent
window.moveInFirstPosition = moveInFirstPosition
window.prepend = prepend
window.lastOf = lastOf
window.flatten = flatten
window.visitUntil = visitUntil

//Utils Filesystem
window.ReaderStreamImage = ReaderStreamImage
window.ReaderStreamVideo = ReaderStreamVideo

//Utils String Validator
window.EmailValidator = EmailValidator
window.PasswordValidator = PasswordValidator
