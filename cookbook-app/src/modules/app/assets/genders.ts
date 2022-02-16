export interface IGender {
    value: string,
    text: string,
    src: string
}

class Gender implements IGender {
    src: string;
    text: string;
    value: string;
    constructor(value: string, text: string, src: string) {
        this.value = value;
        this.text = text;
        this.src = src;
    }
}

export const Female = new Gender("female", "Femmina", require('@assets/icons/genders/female.png'));
export const Male = new Gender("male", "Maschio", require('@assets/icons/genders/male.png'));
export const Other = new Gender("other", "Altro", require('@assets/icons/genders/other.png'));

export default [
    Female,
    Male,
    Other
]