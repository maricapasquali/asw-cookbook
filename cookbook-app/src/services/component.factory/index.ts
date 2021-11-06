import Vue from "vue";
export default function (component: Vue, options: object){
    const ComponentClass = Vue.extend(component)
    return new ComponentClass(options)
}
