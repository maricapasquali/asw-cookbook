import {
    dateFormat,
    isDefined
} from "@utils/lang"

export default function (Vue) {
    Vue.mixin({
        filters: {
            username(user) {
                if (!user) return "Anonimo"
                return isDefined(user.userID) ? user.userID : user
            },
            date(text) {
                return dateFormat(text, "it")
            },
            dateWithSeconds(text) {
                return dateFormat(text, "it", true)
            }
        }
    })
}
