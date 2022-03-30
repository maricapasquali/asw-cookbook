import * as utils from '~/utils'
import filesystem from '~/filesystem'

import validators from '@commons/validator'

export default function installAppPlugins(Vue, {appName}){
    Vue.prototype.app_name = appName

    let channel = new BroadcastChannel(appName)
    channel.onmessage = event => {
        console.error("[Broadcast channel] => Error: ", event)
    }
    Vue.prototype.$broadcastChannel = channel

    Object.assign(window, utils)
    Object.assign(window, filesystem)
    Object.assign(window, validators)

    console.log('Install plugin App Utilities ...')
}