import * as utils from '~/utils'
import filesystem from '~/filesystem'

import * as config from '@root-project/env.config'
import validators from '@root-project/modules/validator'

export default function installAppPlugins(Vue, options){
    Vue.prototype.app_name = config.appName

    let channel = new BroadcastChannel(config.appName)
    channel.onmessage = event => {
        console.error("[Broadcast channel] => Error: ", event)
    }
    Vue.prototype.$broadcastChannel = channel

    Object.assign(window, utils)
    Object.assign(window, filesystem)
    Object.assign(window, validators)

    console.log('Install plugin App Utilities ...')
}