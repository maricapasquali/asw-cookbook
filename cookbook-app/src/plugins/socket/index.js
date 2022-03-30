import {socketIO} from "@services/socket";

export default function installSocket(Vue) {
    Vue.prototype.$socket = socketIO

    console.log('Install plugin socket ...')
}
