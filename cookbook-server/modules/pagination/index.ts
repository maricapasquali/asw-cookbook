import {Document, Query} from "mongoose";

export namespace Pagination {

    export type Options = { page: number, limit: number, skip?: number }

    export type Result = { items: Document[], total: number, paginationInfo?: Options }

    export function ofQueryDocument(query: Query<Document[], Document, {}, Document>, options?: Options): Promise<Result> {
        let qc = query.toConstructor()
        return query.countDocuments()
            .then(nDocs => {
                if(nDocs == 0) return Promise.resolve({ items: [] as Document[] , total: nDocs, paginationInfo: options })
                let _query = new qc()
                let _paginationInfo = options
                if(options) {
                    // console.debug('pagination: ', _paginationInfo)
                    _query = _query.limit(options.limit).skip(((options.page - 1) * options.limit) + (options.skip || 0))
                }
                else _paginationInfo = undefined
                return _query.then(docs => Promise.resolve({ items: docs, total: nDocs, paginationInfo: _paginationInfo }), err => Promise.reject(err))
            }, err => Promise.reject(err))
    }

    export function ofArray(array: Array<any>, options?: Options): Result {
        let start: number = 0
        let end: number = array.length
        if(options){
            start = ((options.page - 1) * options.limit) + (options.skip || 0)
            end = start + options.limit
            // console.debug('start = ', start, ', end = ', end)
        }
        return { items: array.slice(start, end), total: array.length, paginationInfo: options }
    }

}