import api from '@api'

export default function createApiPluginStore(serverConfiguration) {
    return store => {
        store.state._api = api({serverConfiguration, store})
        store.getters.$api = store.state._api
        console.log('Add API plugin on store.')
    }
}
