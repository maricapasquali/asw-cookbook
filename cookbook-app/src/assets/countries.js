module.exports = [
    {text:"Italia",value:"IT", src: require("@assets/icons/flags/italy_flag.png")},
    {text:"Stati Uniti d'America",value:"US",src: require("@assets/icons/flags/united_states_flag.png")},
    {text:"Spagna",value:"ES", src: require("@assets/icons/flags/spain_flag.png")},
    {text:"Regno Unito",value:"GB", src: require("@assets/icons/flags/united_kingdom_flag.png")},
    {text:"Germania",value:"DE", src: require("@assets/icons/flags/germany_flag.png")},
    {text:"Francia",value:"FR", src: require("@assets/icons/flags/france_flag.png")},
    {text:"Messico",value:"MX", src: require("@assets/icons/flags/mexico_flag.png")},
    {text:"Canada",value:"CA", src: require("@assets/icons/flags/canada_flag.png")},
    {text:"Portogallo",value:"PT", src: require("@assets/icons/flags/portugal_flag.png")},
    {text:"Brasile",value:"BR", src: require("@assets/icons/flags/brazil_flag.png")},
    {text:"Russia",value:"RU", src: require("@assets/icons/flags/russia_flag.png")}
].sort((c1, c2) => c1.text.localeCompare(c2.text))