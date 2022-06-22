export default function (bus, store) {

    const options = {
        title: "Commento",
        solid: true
    }

    function commentResponse({ notification, response }) {
        console.debug("comment response => ", { notification, response })
        if (notification) {
            bus.$emit("show:bv-toast", { message: notification.content, options })
            store.commit("notifications/add-unread")
        }
        bus.$emit("comment:response", notification, response)
    }

    function commentReport(data) {
        console.debug("comment report => ", data)
        if (isString(data)) {
            bus.$emit("comment:report", data)
        } else {
            bus.$emit("show:bv-toast", { message: data.content, options })
            store.commit("notifications/add-unread")
            bus.$emit("comment:report", data.otherInfo.comment._id)
        }
    }

    return {
        commentResponse,
        commentReport
    }
}
