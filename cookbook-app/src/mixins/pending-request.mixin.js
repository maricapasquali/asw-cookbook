import { QueuePendingRequests } from "@api/request"

export default {
    data() {
        return {
            pendingRequests: null,
            pendingRequestsMessageCancelAll: "Cancel all pending request from this components."
        }
    },
    created() {
        this.pendingRequests = QueuePendingRequests.create()
    },
    beforeDestroy() {
        this.pendingRequests.cancelAll(this.pendingRequestsMessageCancelAll)
    },
    methods: {
        makeRequestOptions(_id, cancelOptions) {
            return QueuePendingRequests.makeOptions(this.pendingRequests, _id, cancelOptions)
        }
    }
}
