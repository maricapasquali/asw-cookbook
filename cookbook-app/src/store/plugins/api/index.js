import api from '@api'
import {mapping} from '@api/users/friends/utils'
import errorsHandler from "./errors-handler"

import {eventBus} from "@plugins/event-bus"

export default function createApiPluginStore(serverConfiguration) {
    return store => {

        store.$api = api({serverConfiguration, store})

        if(store.$api) {
            store.$api.utils = {
                friends: { mapping }
            }
            store.$api.errorsHandler = errorsHandler(eventBus)
        }

        console.log('Add API plugin on store.')
    }
}
