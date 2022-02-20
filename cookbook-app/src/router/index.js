import Vue from 'vue'
import Router from 'vue-router'
import routes from "./routes";

const originalPush = Router.prototype.push
Router.prototype.push = function push (location) {
    return originalPush.call(this, location).catch(err => err)
}
const originalReplace = Router.prototype.replace
Router.prototype.replace = function replace (location) {
    return originalReplace.call(this, location).catch(err => err)
}

Vue.use(Router)

export default new Router({
    mode: "history",
    routes: routes,
    scrollBehavior: function (to) {
        const offset = { x: 0, y: 0 }
        if (to.hash) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {

                    let el = document.querySelector(to.hash)
                    if(el) {
                        let navigationBar = document.querySelector('.navbar')
                        if(navigationBar) offset.y = navigationBar.clientHeight
                    }
                    resolve({
                        selector: to.hash,
                        offset,
                        behavior: 'smooth'
                    })

                }, 500)
            })
        }
        return offset
    },
})
