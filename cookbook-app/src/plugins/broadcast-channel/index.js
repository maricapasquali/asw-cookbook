export default function installBroadcastChannel(Vue, {appName, store, router}){
    let channel = new BroadcastChannel(appName)

    channel.onmessage = event => {
        const {login} = event.data
        if(login){
            store.dispatch("initialization", login)
                 .then(() => router.go(0))
                 .catch(err => console.error('Broadcast login error: ', err))
        }
    }

    Vue.prototype.$broadcastChannel = channel

    console.log('Install plugin Broadcast channel ...')
}