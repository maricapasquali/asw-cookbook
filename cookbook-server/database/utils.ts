import {Model} from "mongoose";

export async function existById(model: Model<any>, values: Array<string>, filters: object = {}): Promise<true>{
    if(values.length === 0) return Promise.reject('empty')
    let notValid: Array<string> = []
    for (const value of values){
        const doesExit = await model.exists(Object.assign(filters, {_id: value})).catch(err => console.error(err))
        if (!doesExit) notValid.push(value)
    }
    return notValid.length > 0 ? Promise.reject(notValid) : Promise.resolve(true)
}
