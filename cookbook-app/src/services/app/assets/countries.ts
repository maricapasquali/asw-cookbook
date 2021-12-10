export interface ICountry {
    value: string,
    text: string,
    src: string
}

class Country implements ICountry {
    src: string;
    text: string;
    value: string;

    refMap: object;
    constructor(value: string, text: string, src: string, refMap?: object) {
        this.value = value;
        this.text = text;
        this.src = src;
        this.refMap = refMap
    }
}

export const Italy = new Country("IT", "Italia", require("@assets/icons/flags/italy_flag.png"), {class: 'Italy'})
export const USA = new Country("US", "Stati Uniti d'America", require("@assets/icons/flags/united_states_flag.png"), {class: 'United States'})
export const Spain = new Country("ES", "Spagna", require("@assets/icons/flags/spain_flag.png"), {class: 'Spain'})
export const UK = new Country("GB", "Regno Unito", require("@assets/icons/flags/united_kingdom_flag.png"), {class: 'United Kingdom'})
export const Germany = new Country("DE", "Germania", require("@assets/icons/flags/germany_flag.png"), {class: 'Germany'})
export const France = new Country("FR", "Francia", require("@assets/icons/flags/france_flag.png"), {class: 'France'})
export const Mexico = new Country("MX", "Messico", require("@assets/icons/flags/mexico_flag.png"), {class: 'Mexico'})
export const Canada = new Country("CA", "Canada", require("@assets/icons/flags/canada_flag.png"), {class: 'Canada'})
export const Portugal = new Country("PT", "Portogallo", require("@assets/icons/flags/portugal_flag.png"), {class: 'Portugal'})
export const Brazil = new Country("BR", "Brasile", require("@assets/icons/flags/brazil_flag.png"), {class: 'Brazil'})
export const Russia = new Country("RU", "Russia", require("@assets/icons/flags/russia_flag.png"), {class: 'Russian'})

export default [
    Italy,
    USA,
    Spain,
    UK,
    Germany,
    France,
    Mexico,
    Canada,
    Portugal,
    Brazil,
    Russia
].sort((c1, c2) => c1.text.localeCompare(c2.text))