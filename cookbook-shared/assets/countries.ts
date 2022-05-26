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

export const None = new Country("", "-- None --", null)
export const Italy = new Country("IT", "Italia", "/icons/italy_flag.png", {class: 'Italy'})
export const USA = new Country("US", "Stati Uniti d'America", "/icons/united_states_flag.png", {class: 'United States'})
export const Spain = new Country("ES", "Spagna", "/icons/spain_flag.png", {class: 'Spain'})
export const UK = new Country("GB", "Regno Unito", "/icons/united_kingdom_flag.png", {class: 'United Kingdom'})
export const Germany = new Country("DE", "Germania", "/icons/germany_flag.png", {class: 'Germany'})
export const France = new Country("FR", "Francia", "/icons/france_flag.png", {class: 'France'})
export const Mexico = new Country("MX", "Messico", "/icons/mexico_flag.png", {class: 'Mexico'})
export const Canada = new Country("CA", "Canada", "/icons/canada_flag.png", {class: 'Canada'})
export const Portugal = new Country("PT", "Portogallo", "/icons/portugal_flag.png", {class: 'Portugal'})
export const Brazil = new Country("BR", "Brasile", "/icons/brazil_flag.png", {class: 'Brazil'})
export const Russia = new Country("RU", "Russia", "/icons/russia_flag.png", {class: 'Russian'})

const countries: Country[] =  [
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

countries.unshift(None)

export default countries
