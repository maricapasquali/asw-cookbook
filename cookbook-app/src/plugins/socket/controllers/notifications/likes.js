
export default function (bus, store) {

    const options = {
        title: "Mi piace",
        solid: true
    }

    function likeRecipe({ notification, like }) {
        console.debug("like recipe => ", notification, like)
        if (notification.content) {
            bus.$emit("show:bv-toast", { message: notification.content, options })
            store.commit("notifications/add-unread")
        }
        bus.$emit("like:recipe", notification, like)
    }

    function likeComment({ notification, like }) {
        console.debug("like comment => ", notification, like)
        if (notification.content) {
            bus.$emit("show:bv-toast", { message: notification.content, options })
            store.commit("notifications/add-unread")
        }
        bus.$emit("like:comment", notification, like)
    }

    return {
        likeRecipe,
        likeComment
    }
}