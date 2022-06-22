import Vue from "vue"

export const eventBus = new Vue()

export default function installEventBus(Vue) {

    Vue.prototype.$bus = eventBus

    console.debug("Install plugin Event Bus ...")
}
