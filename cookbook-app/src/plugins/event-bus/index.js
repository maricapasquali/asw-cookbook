import Vue from "vue";

export const eventBus = new Vue()

export default function installEventBus(Vue, options){

    Vue.prototype.$bus = eventBus

    console.log('Install plugin Event Bus ...')
}