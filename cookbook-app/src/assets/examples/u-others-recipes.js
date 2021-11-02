module.exports = [
    {
        _id: '1231413421321443',
        timestamp: Date.parse("2021-10-20T10:41:00"),
        name: 'Tagliatelle al ragù',
        category: 'first courses',
        country: 'IT',
        likes: [],
        comments: [{
            number: 1,
            content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
            timestamp: Date.parse("2021-10-23T13:41:00"),
            likes: [],
            reported: false
        }],

        ingredients: [
            {foodID: 'food-1', name: 'pomodori', quantity: 400}
        ],
        preparation: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        tutorial: '',
        diet: '',
        img: 'https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fwww.iloveitalianfood.it%2Fwp-content%2Fuploads%2F2017%2F07%2F1.558-Tagliatelle-al-rag-doca1.jpg&f=1&nofb=1'
    },
    {
        _id: '1231413421321445',
        timestamp: Date.parse("2021-10-21T10:41:00"),
        name: 'Funghi all\'aglio',
        category: 'second courses',
        country: 'IT',
        likes: [],
        comments: [{
            number: 1,
            content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
            timestamp: Date.parse("2021-10-22T13:41:00"),
            likes: [],
            reported: false
        }],

        ingredients: [
            {foodID: 'food-8', name: 'carne suino', quantity: 400}
        ],
        preparation: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        tutorial: '',
        diet: ''
    },

    {
        _id: '1231413421321444',
        timestamp: Date.parse("2021-10-19T10:41:00"),
        name: 'Parmigiana di melanzane',
        category: 'second courses',
        country: 'IT',
        likes: [],
        comments: [{
            number: 1,
            content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
            timestamp: Date.parse("2021-10-23T13:41:00"),
            likes: [],
            reported: false
        }],

        ingredients: [
            {foodID: 'food-8', name: 'carne suino', quantity: 400}
        ],
        preparation: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        tutorial: '',
        diet: '',
        img: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.ricettadoc.it%2Fwp-content%2Fuploads%2F2016%2F06%2FParmigiana-di-melanzane-13.jpg&f=1&nofb=1'
    }
].sort((c1, c2) => c2.timestamp - c1.timestamp)/* -> decrescente */