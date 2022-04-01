import Vue from 'vue'
import router from '@router'
import store from '@store'
import App from '@/App'

import * as envConfig from "@environment/env.config";

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
    faUndo,
    faBan,
    faPlus
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
library.add(faBarcode, faMinus, faPlusCircle, faTimesCircle, faSearch,
            faSearchMinus, faSearchPlus,faTimes, faBars, faUsers, faUndo, faBan, faPlus)
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.config.productionTip = false

// Import Vue Zommer component
import VueZoomer from 'vue-zoomer'
Vue.use(VueZoomer)

// Import my components
import Components from "@components"
Vue.use(Components)

// Import my Plugins
import AppPlugins from '@plugins'
Vue.use(AppPlugins, envConfig)

new Vue({
    router,
    store: store(envConfig),
    render: h => h(App),
}).$mount('#app')
