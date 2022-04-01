import EventBusPlugin from './event-bus'
import SocketPlugin from './socket'

import * as utils from '@utils/'
import filesystem from '@utils/filesystem'

import validators from '@commons/validator'

export default function installAppPlugins(Vue, configurationEnvironment){
    Vue.prototype.app_name = configurationEnvironment.appName

    let channel = new BroadcastChannel(configurationEnvironment.appName)
    channel.onmessage = event => {
        console.error("[Broadcast channel] => Error: ", event)
    }
    Vue.prototype.$broadcastChannel = channel

    Object.assign(window, utils)
    Object.assign(window, filesystem)
    Object.assign(window, validators)

    console.log('Install plugin App Utilities ...')

    Vue.use(EventBusPlugin)

    Vue.use(SocketPlugin)
}
