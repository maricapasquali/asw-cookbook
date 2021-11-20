module.exports = [
  {
    _id: '1231413421321asx',
    timestamp: Date.parse("2021-10-23T10:41:00"),
    name: 'Fiorentina al sangue',
    category: 'second courses',
    country: 'IT',
    likes: [{user: {_id:'6140db2a3071f72df88a1f6b', userID: 'marina'}, timestamp: Date.parse("2021-10-23T15:00:00")}, {user: 'anonymous', timestamp: Date.parse("2021-10-25T17:00:20")}],
    comments: [{
      number: 1,
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      timestamp: Date.parse("2021-10-23T13:41:00"),
      likes: [],
      reported: false
    }],

    ingredients: [
      {foodID: 'food-8', name: 'carne bovina', quantity: 400}
    ],
    preparation: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    tutorial: '',
    diet: '',
    img: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn.cook.stbm.it%2Fthumbnails%2Fricette%2F142%2F142156%2Fhd750x421.jpg&f=1&nofb=1'
  },
  {
    _id: '1231413421321asZ',
    timestamp: Date.parse("2021-10-25T10:41:00"),
    name: 'Pomodori al forno',
    category: 'side dish',
    country: 'IT',
    likes: [],
    comments: [],
    ingredients: [
      {foodID: 'food-1', name: 'pomodori', quantity: 400},
      {foodID: 'food-9', name: 'olio extra vergine d\'oliva', quantity: 10},
    ],
    preparation: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    tutorial: 'https://localhost:3000/videos/tutorial-1231413421321asZ.mp4',
    diet: 'vegetarian',
    note: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    img: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fblog.giallozafferano.it%2Fvaleriaciccotti%2Fwp-content%2Fuploads%2F2020%2F07%2Fpomo-12-1.jpg&f=1&nofb=1'
  },
  {
    _id: '1231413421321as0',
    timestamp: Date.parse("2021-10-22T10:41:00"),
    name: 'Ceci',
    category: 'side dish',
    country: '',
    likes: [],
    comments: [],
    ingredients: [
      {foodID: 'food-6', name: 'ceci', quantity: 400}
    ],
    preparation: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    tutorial: '',
    diet: '',
    img: ''
  }
].sort((c1, c2) => c2.timestamp - c1.timestamp)/* -> decrescente */