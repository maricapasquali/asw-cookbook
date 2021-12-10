import * as users from './users'
import * as foods from './foods'
import * as recipes from './recipes'
import * as shoppingList from './shopping-list'
import {images_origin, server_origin} from "../../../../modules/hosting/variables";

export const Server = {
    api: {
        origin: process.env.VUE_APP_SERVER_ORIGIN || server_origin
    },
    images: {
        origin: process.env.VUE_APP_IMAGES_ORIGIN || images_origin,
        has: function (val: string): boolean {
            return val.search(this.origin) !== -1
        },
        path: function (endPoint){
            if(this.has(endPoint)) return endPoint
            return `${this.origin}/${endPoint}`
        }
    }
}

export default {
    users,
    foods,
    recipes,
    shoppingList
}