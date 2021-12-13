import Vue from 'vue'
import Router from 'vue-router'
import routes from "./routes";
import * as handlerErrors from './handlerErrors'
Vue.use(Router)

export const HandlerErrors = handlerErrors

export default new Router({
    mode: "history",
    routes: routes,
})
