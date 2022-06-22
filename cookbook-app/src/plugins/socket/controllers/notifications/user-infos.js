export default function (bus, store, router) {
    const options = {
        title: "Utente",
        solid: true
    }

    function afterUpdatePassword(notification) {
        console.debug("update password => ", notification)
        bus.$emit("show:bv-toast", { message: notification.content, options })
        store.commit("notifications/add-unread")
        bus.$emit("user:update:password", notification)
    }

    function onAddStrike({ notification, strike }) {
        console.debug("strike user => ", notification)
        bus.$emit("show:bv-toast", { message: notification.content, options })
        bus.$emit("user:strike", notification)
        store.commit("notifications/add-unread")
        if (strike === 3) {
            store.dispatch("reset")
            router.replace({ name: "homepage" })
        }
    }

    return {
        afterUpdatePassword,
        onAddStrike
    }
}
