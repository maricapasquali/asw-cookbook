import Vue from 'vue'
import router from '@router'
import store from '@store'

import App from '@/App'

import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
// Import Bootstrap an BootstrapVue CSS files (order is important)
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin)

// Import Fort Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import {
    faBarcode,
    faMinus,
    faPlusCircle,
    faTimesCircle,
    faSearch,
    faSearchMinus,
    faSearchPlus,
    faTimes,
    faBars,
    faUsers,
    faUndo
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
library.add(faBarcode, faMinus, faPlusCircle, faTimesCircle, faSearch,
            faSearchMinus, faSearchPlus,faTimes, faBars, faUsers, faUndo)
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.config.productionTip = false

// Import Vue Zommer component
import VueZoomer from 'vue-zoomer'
Vue.use(VueZoomer)

// Import my components
import Components from "@components"
Vue.use(Components)

// Import my event bus
import EventBusPlugin from '@event-bus'
Vue.use(EventBusPlugin)

// Import my socket.io
import SocketPlugin from '@socket'
Vue.use(SocketPlugin)

// Import my utils
import AppPlugins from '@/plugins'
Vue.use(AppPlugins)

new Vue({
    router,
    store,
    render: h => h(App),
}).$mount('#app')