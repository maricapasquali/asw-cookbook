import {Model} from "mongoose";

/**
 * @param model instance of mongoose collection ({@link Model})
 * @param values array of strings "__id_ "
 * @param filters filters to apply to the query
 * @return a promise which resolves when all __ids_ exist in collection _model_ and as a result it returns true,
 *         otherwise it rejects and as a result it returns an array of non-existent __id_
 */
export async function existById(model: Model<any>, values: Array<string>, filters: object = {}): Promise<true>{
    if(values.length === 0) return Promise.reject('empty')
    let notValid: Array<string> = []
    for (const value of values) {
        const doesExit = await model.exists(Object.assign(filters, {_id: value})).catch(err => console.error(err))
        if (!doesExit) notValid.push(value)
    }
    return notValid.length > 0 ? Promise.reject(notValid) : Promise.resolve(true)
}
