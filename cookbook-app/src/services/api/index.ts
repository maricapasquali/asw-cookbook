import * as users from './users'
import * as foods from './foods'
import * as recipes from './recipes'
import * as shoppingList from './shopping-list'
import {images_origin, server_origin, video_origin} from "../../../../modules/hosting/variables";

function _path(origin: string, endPoint: string): string {
    if(endPoint.search(origin) !== -1) return endPoint
    return `${origin}/${endPoint}`
}

export const Server = {
    api: {
        origin: process.env.VUE_APP_SERVER_ORIGIN || server_origin
    },
    images: {
        origin: process.env.VUE_APP_IMAGES_ORIGIN || images_origin,
        path: function (endPoint){
            return _path(this.origin, endPoint)
        }
    },
    videos: {
        origin: process.env.VUE_APP_VIDEOS_ORIGIN || video_origin,
        path: function (endPoint){
            return _path(this.origin, endPoint)
        }
    }
}

export default {
    users,
    foods,
    recipes,
    shoppingList
}