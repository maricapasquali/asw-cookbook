import {Schema} from "mongoose";

export interface ICountry {
    flag?: string
    code: string
    name: string
}

export const CountrySchema: Schema<ICountry> = new Schema<ICountry>({
    _id: false,
    flag: { type: String, required: false },
    name: { type: String, required: true },
    code: { type: String, required: true}
})