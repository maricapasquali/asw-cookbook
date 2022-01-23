import Vue from 'vue'
import Router from 'vue-router'
import routes from "./routes";
import * as handlerErrors from './handlerErrors'
Vue.use(Router)

export const HandlerErrors = handlerErrors

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
