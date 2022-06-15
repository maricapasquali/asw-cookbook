import {
    Document,
    Query
} from "mongoose"

export namespace Pagination {

    /**
     * {@link Pagination.Options} represents the information of pagination.
     */
    export type Options = {
        /**
         * Number of current page
         */
        page: number
        /**
         * Number of documents to keep for page
         */
        limit: number
        /**
         * (Optional) Number of documents to skip for page
         */
        skip?: number
    }

    /**
     * {@link Pagination.Result} represents a result of pagination.
     */
    export type Result = {
        /**
         * List of selected documents
         */
        items: Document[]
        /**
         * Total number of documents in the database
         */
        total: number
        /**
         *  (Optional) Information of pagination
         */
        paginationInfo?: Options
    }

    /**
     * @param query to be paginated
     * @param options (optional) information of pagination ({@link Pagination.Options})
     * @return {@link Promise} of {@link Pagination.Result}
     */
    export function ofQueryDocument(query: Query<Document[], Document, object, Document>, options?: Options): Promise<Result> {
        const QueryConstructor = query.toConstructor()
        return query.countDocuments()
            .then(nDocs => {
                if (nDocs == 0) return Promise.resolve({ items: [] as Document[], total: nDocs, paginationInfo: options })
                let _query = new QueryConstructor()
                if (options) {
                    // console.debug('pagination options: ', options)
                    _query = _query.limit(options.limit).skip(((options.page - 1) * options.limit) + (options.skip || 0))
                }
                return _query.then(docs => Promise.resolve({ items: docs, total: nDocs, paginationInfo: options }), err => Promise.reject(err))
            }, err => Promise.reject(err))
    }

    /**
     * @param array to be paginated
     * @param options (optional) information of pagination ({@link Pagination.Options})
     * @return an instance of {@link Pagination.Result}
     */
    export function ofArray(array: any[], options?: Options): Result {
        let start = 0
        let end: number = array.length
        if (options) {
            start = ((options.page - 1) * options.limit) + (options.skip || 0)
            end = start + options.limit
        // console.debug('start = ', start, ', end = ', end)
        }
        return { items: array.slice(start, end), total: array.length, paginationInfo: options }
    }

}
