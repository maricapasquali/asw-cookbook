export interface IGender {
    value: string
    text: string
    src?: string
}

class Gender implements IGender {
    src?: string
    text: string
    value: string
    constructor(value: string, text: string, src?: string) {
        this.value = value
        this.text = text
        this.src = src
    }
}

export const None = new Gender("", "-- None --")
export const Female = new Gender("female", "Femmina", "/icons/female.png")
export const Male = new Gender("male", "Maschio", "/icons/male.png")
export const Other = new Gender("other", "Altro", "/icons/other.png")

export default [
    None,
    Female,
    Male,
    Other
]
