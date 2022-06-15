export interface IRecipeCategory {
    value: string
    text: string
}

class RecipeCategory implements IRecipeCategory {
    text: string
    value: string
    constructor(value: string, text: string) {
        this.value = value
        this.text = text
    }
}

export const Appetizers = new RecipeCategory("appetizers", "Anti pasto")
export const FirstCourses = new RecipeCategory("first courses", "Primo piatto")
export const SecondCourses = new RecipeCategory("second courses", "Secondo piatto")
export const Desserts = new RecipeCategory("desserts", "Dolci")
export const Drink = new RecipeCategory("drink", "Drink")
export const SideDish = new RecipeCategory("side dish", "Contorno")

export default [
    Appetizers,
    FirstCourses,
    SecondCourses,
    Desserts,
    Drink,
    SideDish
]