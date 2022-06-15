import Vue from "vue"
import Router from "vue-router"
import routes from "./routes"

import { eventBus as bus } from "../plugins/event-bus"

["push", "replace"].forEach(method => {
    const originalMethod = Router.prototype[method]

    Router.prototype[method] = function (location) {
        return originalMethod.call(this, location).catch(err => {
            if (err?.name === "NavigationDuplicated") {
                console.debug(err.name)
                bus.$emit("force:reload-route", true)
                setTimeout(b => b.$emit("force:reload-route", false), 0, bus)
            } else console.error(err)
        })
    }
})

Vue.use(Router)

export default new Router({
    mode: "history",
    routes: routes,
    scrollBehavior(to) {
        const offset = { x: 0, y: 0 }
        if (to.hash) {
            return new Promise(resolve => {
                setTimeout(() => {

                    let el = document.querySelector(to.hash)
                    if (el) {
                        let navigationBar = document.querySelector(".navbar")
                        if (navigationBar) offset.y = navigationBar.clientHeight
                    }
                    resolve({
                        selector: to.hash,
                        offset,
                        behavior: "smooth"
                    })

                }, 500)
            })
        }
        return offset
    },
})
