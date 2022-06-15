import * as mongoose from "mongoose"

/**
 * MongooseDuplicateError is extension of {@link mongoose.Error} that represents the error of duplication resource.
 */
export class MongooseDuplicateError extends mongoose.Error {
    readonly code: number = MongooseDuplicateError.code
    constructor(msg?: string) {
        super(msg || "custom mongoose error for duplicate")
    }
}
export namespace MongooseDuplicateError {
    /**
     * Error code of _MongooseDuplicateError_
     */
    export const code = 11000

    /**
     * @param error to check
     * @return true if _error_ is instance of _MongooseDuplicateError_
     */
    export function is(error: any): boolean {
        return code === error.code
    }
}

export namespace MongooseValidationError {
    /**
     * Error name of _ValidationError_
     */
    export const name = "ValidationError"

    /**
     * @param error to check
     * @return true if _error_ is instance of _ValidationError_
     */
    export function is(error: any) {
        return name === error.name
    }
}
