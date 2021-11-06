import Vue from 'vue'
import App from '@/App'
import router from '@router'
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
    faBars

} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
library.add(faBarcode, faMinus, faPlusCircle, faTimesCircle, faSearch,
            faSearchMinus, faSearchPlus,faTimes, faBars)
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.config.productionTip = false

import components from "@components"
Object.values(components).forEach(comp => Vue.component(comp.name, comp))

export const bus = new Vue();

new Vue({
    router,
    render: h => h(App),
}).$mount('#app')