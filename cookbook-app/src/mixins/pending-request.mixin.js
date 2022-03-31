import {QueuePendingRequests} from "@api/request";

export default {
    data(){
        return {
            pendingRequests: null,
            pendingRequestsMessageCancelAll: 'Cancel all pending request from this components.'
        }
    },
    methods: {
        makeRequestOptions(_id, cancelOptions){
            return QueuePendingRequests.makeOptions(this.pendingRequests, _id, cancelOptions)
        }
    },
    created() {
        this.pendingRequests = QueuePendingRequests.create()
    },
    beforeDestroy() {
        this.pendingRequests.cancelAll(this.pendingRequestsMessageCancelAll)
    }
}