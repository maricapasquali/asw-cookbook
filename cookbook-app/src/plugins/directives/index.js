import resize from "./resize";
import outside from "./outside";  // CLICK FUORI
import scroll from "./scroll";

const directives = {
    resize,
    outside,
    scroll
}

export default function installDirectives(Vue) {
    Object.entries(directives).forEach(([id, directive]) => Vue.directive(id, directive))

    console.debug('Install plugin Directives ...')
}