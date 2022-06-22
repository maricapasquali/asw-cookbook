export interface IDiet {
    value: string
    text: string
}

class Diet implements IDiet {
    text: string
    value: string
    constructor(value: string, text: string) {
        this.value = value
        this.text = text
    }
}

export const None = new Diet("", "-- None --")
export const Light = new Diet("light", "Light")
export const GlutenFree = new Diet("gluten free", "Senza glutine")
export const LactoseFree = new Diet("lactose free", "Senza lattosio")
export const Vegan = new Diet("vegan", "Vegano")
export const Vegetarian = new Diet("vegetarian", "Vegetariano")

export default [
    None,
    Light,
    GlutenFree,
    LactoseFree,
    Vegan,
    Vegetarian
]