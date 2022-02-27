import Vue from 'vue'
import Router from 'vue-router'
import routes from "./routes";

const originalPush = Router.prototype.push
Router.prototype.push = function push (location) {
    return originalPush.call(this, location).catch(err => Router.prototype.go.call(this))
}
const originalReplace = Router.prototype.replace
Router.prototype.replace = function replace (location) {
    return originalReplace.call(this, location).catch(err => Router.prototype.go.call(this))
}

Vue.use(Router)

export function scrollToRouterHash(){
    if(this.$route.hash) {
        let el = document.querySelector(this.$route.hash)
        if(el) {
            el.scrollIntoView(true);
            let navigationBar = document.querySelector('.navbar')
            let navHeight = navigationBar ? navigationBar.clientHeight : 0
            let scrolledY = window.scrollY;
            if(scrolledY) window.scroll(0, scrolledY - navHeight);
        }
    }
}

export default new Router({
    mode: "history",
    routes: routes,
    scrollBehavior: function (to) {
        if (to.hash) {
            return {
                selector: to.hash,
                behavior: 'smooth',
            }
        }
    },
})
