import Vue from "vue";

import notificationEmitter from "./notifications";
import messagesEmitter from "./messages";
import updatesEmitter from "./updates";
import requestErrorEmitter from "./handler-api-errors";

const eventBus = new Vue()

export default function installEventBus(Vue, options){
    Vue.prototype.$bus = eventBus

    Vue.prototype.$bus.notification = notificationEmitter(eventBus)
    Vue.prototype.$bus.chat = messagesEmitter(eventBus)
    Vue.prototype.$bus.update = updatesEmitter(eventBus)


    Vue.prototype.handleRequestErrors = requestErrorEmitter(eventBus)

    console.log('Install plugin Event Bus ...')
}