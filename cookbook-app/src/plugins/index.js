import * as utils from '~/utils'
import app from '~/app'
import filesystem from '~/filesystem'

import * as appConfig from '@root-project/app.config.json'
import validators from '@root-project/modules/validator'

export default function installAppPlugins(Vue, options){
    Vue.prototype.app_name = appConfig.app_name

    Object.assign(window, utils)
    Object.assign(window, app)
    Object.assign(window, filesystem)
    Object.assign(window, validators)

    console.log('Install plugin App Utilities ...')
}