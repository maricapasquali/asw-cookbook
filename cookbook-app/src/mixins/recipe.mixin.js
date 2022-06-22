import { mapGetters } from "vuex"

export default {
    computed:{
        ...mapGetters(["getDietByValue", "getRecipeCategoryByValue"]),
    },
    methods: {
        setDefaultValueOn(docs) {
            const setting = recipe => {

                let category = this.getRecipeCategoryByValue(recipe.category)
                if (category) Object.assign(recipe, { category })

                Object.assign(recipe, { diet: this.getDietByValue(recipe.diet) || this.getDietByValue("") })
            }
            if (Array.isArray(docs)) docs.forEach(recipe => setting(recipe))
            else setting(docs)
        },
    }
}
