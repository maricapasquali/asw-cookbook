export default function (Vue, options) {
    Vue.mixin({
        filters: {
            capitalize(text){
                if(!text) return text
                return text.replace(/^\w/, c => c.toUpperCase());
            }
        }
    })
}