import * as users from './users'
import * as friends from './users/friends'
import * as foods from './foods'
import * as recipes from './recipes'
import * as shoppingList from './shopping-list'
import * as notifications from './notifications'
import * as chats from './chats'

import * as config from "../../../env.config";
const ServerConfiguration = config.server
const ServerSubDomainConfiguration = ServerConfiguration["sub-domain"]

function _path(origin: string, endPoint: string): string {
    if(endPoint.search(origin) !== -1) return endPoint
    return `${origin}/${endPoint}`
}

export const Server = {
    origin: process.env.VUE_APP_SERVER_ORIGIN || ServerConfiguration.origin,
    api: {
        origin: process.env.VUE_APP_API_ORIGIN || ServerSubDomainConfiguration.api
    },
    images: {
        origin: process.env.VUE_APP_IMAGES_ORIGIN || ServerSubDomainConfiguration.images,
        path: function (endPoint){
            return _path(this.origin, endPoint)
        }
    },
    videos: {
        origin: process.env.VUE_APP_VIDEOS_ORIGIN || ServerSubDomainConfiguration.videos,
        path: function (endPoint){
            return _path(this.origin, endPoint)
        }
    }
}

export default {
    users,
    friends,
    foods,
    recipes,
    shoppingList,
    notifications,
    chats
}