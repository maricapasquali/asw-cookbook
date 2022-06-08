// Import utils
import "@utils"
// Import Vue
import Vue from 'vue'
// Import Bootstrap Vue and Icon Plugin
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
// Import Bootstrap an BootstrapVue CSS files (order is important)
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
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
// Import Vue Zommer component
import VueZoomer from 'vue-zoomer'
// Import router
import router from '@router'
// Import store
import store from '@store'
// Import App view
import App from '@/App'
// Import my components
import Components from "@components"
// Import my Plugins
import AppPlugins from '@plugins'
// Import Environment Variables
import envConfig from "cookbook-shared/dist/environment";
// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin)

library.add(faBarcode, faMinus, faPlusCircle, faTimesCircle, faSearch, faSearchMinus, faSearchPlus,faTimes, faBars, faUsers, faUndo, faBan, faPlus)

Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false

Vue.use(VueZoomer)

Vue.use(Components)

const storeInstance = store(envConfig)

Vue.use(AppPlugins, { configurationEnvironment: envConfig, store: storeInstance, router })

new Vue({
    router,
    store: storeInstance,
    render: h => h(App),
}).$mount('#app')
