import api from '@api'

export default function installApi(Vue, {serverConfiguration}){
    Vue.prototype.$api = api(serverConfiguration)

    console.log('Install plugin api ...')
}


