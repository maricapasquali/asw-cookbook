export interface ICountry {
    value: string,
    text: string,
    src: string
}

class Country implements ICountry {
    src: string;
    text: string;
    value: string;
    constructor(value: string, text: string, src: string) {
        this.value = value;
        this.text = text;
        this.src = src;
    }
}

export const Italy = new Country("IT", "Italia", require("@assets/icons/flags/italy_flag.png"))
export const USA = new Country("US", "Stati Uniti d'America", require("@assets/icons/flags/united_states_flag.png"))
export const Spain = new Country("ES", "Spagna", require("@assets/icons/flags/spain_flag.png"))
export const UK = new Country("GB", "Regno Unito", require("@assets/icons/flags/united_kingdom_flag.png"))
export const Germany = new Country("DE", "Germania", require("@assets/icons/flags/germany_flag.png"))
export const France = new Country("FR", "Francia", require("@assets/icons/flags/france_flag.png"))
export const Mexico = new Country("MX", "Messico", require("@assets/icons/flags/mexico_flag.png"))
export const Canada = new Country("CA", "Canada", require("@assets/icons/flags/canada_flag.png"))
export const Portugal = new Country("PT", "Portogallo", require("@assets/icons/flags/portugal_flag.png"))
export const Brazil = new Country("BR", "Brasile", require("@assets/icons/flags/brazil_flag.png"))
export const Russia = new Country("RU", "Russia", require("@assets/icons/flags/russia_flag.png"))

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