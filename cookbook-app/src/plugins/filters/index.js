import {dateFormat, isDefined} from "@utils/lang";

export default function (Vue, options) {
    Vue.mixin({
        filters: {
            username(user){
                if(!user) return "Anonimo"
                return isDefined(user.userID) ? user.userID : user
            },
            date: function (text){
                return dateFormat(text, "it")
            },
            dateWithSeconds: function (text){
                return dateFormat(text, "it", true)
            }
        }
    })
}