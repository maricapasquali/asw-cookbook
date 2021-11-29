import * as mongoose from "mongoose";

export class MongooseDuplicateError extends mongoose.Error {
    readonly code: number = MongooseDuplicateError.code
    constructor(msg?: string) {
        super(msg || "custom mongoose error for duplicate");
    }
}
export namespace MongooseDuplicateError {
    export const code: number = 11000
    export function is(error: any){
        return code === error.code
    }
}

export namespace MongooseValidationError {
    export const name: string = 'ValidationError'
    export function is(error: any){
        return name === error.name
    }
}