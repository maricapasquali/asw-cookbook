export default function (bus, store, socket) {

    function checkRefreshToken({ expired, message, previousEmittedEvent }) {

        function emitPrevEvent() {
            socket.emit(previousEmittedEvent.event, ...previousEmittedEvent.args)
            console.debug("Re-Emit previous event on socket.io.")
        }

        function emitError() {
            console.error(message)
            bus.$emit(expired ? "show:error:unauthenticated" : "show:error:forbidden", { message })
        }

        store.dispatch("session/requestNewAccessToken")
            .then(res => {
                console.debug("Response 'requestNewAccessToken' = ", res)
                if (previousEmittedEvent && (res?.status === 200 || res?.status === 204)) {
                    console.debug("Previous emitted event ", previousEmittedEvent)
                    if (/chat:(?:messages|typing|read)/.test(previousEmittedEvent.event)) {
                        socket.on("connect", () => {
                            bus.$emit("chat:re-enter")
                            socket.on("enter", emitPrevEvent)
                        })
                    } else if (previousEmittedEvent.event === "connect") {
                        socket.connect()
                        console.debug("Re-Connect again..")
                    } else emitPrevEvent()
                    bus.$emit("hide:errors")
                } else {
                    emitError()
                }
            })
    }

    function onConnectError(error) {
        if (error.data) {
            let expired = error.data.expired
            let message = error.message
            let previousEmittedEvent = error.data.previousEmittedEvent
            checkRefreshToken({ expired, message, previousEmittedEvent })
        }
    }

    return {
        checkRefreshToken,
        onConnectError
    }
}
