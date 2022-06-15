import axios, {
    CancelToken,
    CancelTokenSource
} from "axios"
import { isBoolean } from "../../utils/lang"

interface IQueuePendingRequests {
    push: (id: string, request: CancelTokenSource) => void
    remove: (id: string) => void
    cancel: (id: string, message?: string) => void
    cancelAll: (message?: string) => void
}

type PendingRequest = { _id: string, request: CancelTokenSource }

export class QueuePendingRequests implements IQueuePendingRequests {

    private readonly MESSAGE_DEFAULT: string = "Operation canceled by user."
    private readonly _pendingRequests: PendingRequest[]

    private constructor() {
        this._pendingRequests = []
    }

    static create(): QueuePendingRequests {
        return new QueuePendingRequests()
    }

    private find(id: string): CancelTokenSource {
        return this._pendingRequests.find(p => p._id === id)?.request
    }

    private findIndex(id: string): number | false {
        const index = this._pendingRequests.findIndex(p => p._id === id)
        return index >= 0 ? index: false
    }

    push(id: string, request: CancelTokenSource): void {
        const _request = this.find(id)
        if(!_request) {
            this._pendingRequests.push({ _id: id, request })
            console.debug("Queue Request push : ", this._pendingRequests)
        }
    }

    remove(id: string): void {
        const index = this.findIndex(id)
        if(index) {
            this._pendingRequests.splice(index)
            console.debug("Queue Request remove : ", this._pendingRequests)
        }
    }

    cancel(id: string, message?: string): void {
        const request = this.find(id)
        if(request) {
            request.cancel(message || this.MESSAGE_DEFAULT)
            console.debug("Queue Request cancel : ", this._pendingRequests)
            this.remove(id)
        }
    }

    cancelAll(message?: string): void {
        if(this._pendingRequests.length){
            this._pendingRequests.forEach(p => p.request.cancel(message || this.MESSAGE_DEFAULT))
            this._pendingRequests.splice(0)
            console.debug("Queue Request cancel-all : ", this._pendingRequests)
        }
    }
}

export namespace QueuePendingRequests {
    export function makeOptions(pendingRequests: QueuePendingRequests, _id: string, cancelOptions?: boolean | { message?: string } ): { cancelToken: CancelToken } {
        if(cancelOptions) {
            let _message
            if (!isBoolean(cancelOptions)) _message = (cancelOptions as any)?.message
            pendingRequests.cancel(_id, _message)
        }
        const source = axios.CancelToken.source()
        pendingRequests.push(_id, source)
        return { cancelToken: source.token }
    }
}

export function isAbortError(err: any): boolean {
    const isAbort = axios.isCancel(err)
    if(isAbort) console.error("Request canceled : ", err.message)
    return isAbort
}
