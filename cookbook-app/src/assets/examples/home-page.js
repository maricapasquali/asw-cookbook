module.exports = [
    {
        owner: {
            _id: '61254b88c318b092d0299a0a',
            userID: 'mario088'
        },
        recipe : {
            _id: '1231413421321asx',
            timestamp: Date.parse("2021-10-23T10:41:00"),
            name: 'Fiorentina al sangue',
            category: 'second courses',
            nationality: '',
            likes: 0,
            comments: [       {
                number: 1,
                content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
                timestamp: Date.parse("2021-10-23T13:41:00"),
                likes: 0,
                reported: false
            }],
        }
    },
    {
        owner: {
            _id: '612df857e9e11fd2d82cb95f',
            userID: 'maricapasquali01'
        },
        recipe : {
            _id: '1231413421321asa',
            timestamp:  Date.parse("2021-10-21T10:30:00"),
            name: 'Pancake',
            category: 'desserts',
            nationality: 'US',
            likes: 0,
            comments: [
                {
                    number: 12,
                    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
                    timestamp: Date.parse("2021-10-21T14:00:00"),
                    likes: 0,
                    reported: true
                },
                {
                    number: 11,
                    user: {userID: "hanna smith", _id: "sfsfw3223"},
                    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
                    timestamp: Date.parse("2021-10-20T12:00:00"),
                    likes: 0,
                    reported: false
                },
                {

                    number: 10,
                    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
                    timestamp: Date.parse("2021-10-19T12:00:00"),
                    likes: 0,
                    reported: false,
                    response: {
                        owner_recipe: {
                            _id: '612df857e9e11fd2d82cb95f',
                            userID: "maricapasquali01",
                            img: ""
                        },
                        timestamp: Date.parse("2021-10-19T13:00:00"),
                        content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                        likes: 0,
                        reported: false
                    }
                },
            ],
        },
    },
    {
        owner: {
            _id: '61254b88c318b092d0299a0a',
            userID: 'mario088'
        },
        recipe : {
            _id: '1231413421321asB',
            timestamp: Date.parse("2021-10-18T10:30:00"),
            name: 'Lasagne',
            category: 'first courses',
            nationality: 'IT',
            likes: 5,
            comments: [],
        }
    },
    {
        owner: {
            _id: '61254b88c318b092d0299a0a',
            userID: 'mario088'
        },
        recipe : {
            _id: '1231413421321asc',
            timestamp: Date.parse("2021-10-17T12:30:00"),
            name: 'Spaghetti alla carbonara',
            category: 'first courses',
            nationality: 'IT',
            likes: 0,
            comments: [],
        }
    }
]