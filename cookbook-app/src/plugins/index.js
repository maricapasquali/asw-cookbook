import BroadcastChannelPlugin from './broadcast-channel'
import DirectivePlugin from './directives'
import EventBusPlugin, {eventBus} from './event-bus'
import SocketPlugin from './socket'

export default function installAppPlugins(Vue, {configurationEnvironment, store, router}){

    Vue.prototype.$appName = configurationEnvironment.appName

    console.debug('Install plugin App Utilities ...')

    Vue.use(DirectivePlugin)

    Vue.use(BroadcastChannelPlugin, { appName: configurationEnvironment.appName, store, router })

    Vue.use(EventBusPlugin)

    Vue.use(SocketPlugin, { bus: eventBus, store, router })
}
