module.exports =  [
    {_id: 'food-1', name: 'pomodori', nutritional_values: {energy: 18},barcode: '808081', owner: {user: {userID: 'maricapasquali01', _id: '612df857e9e11fd2d82cb95f'}, timestamp: Date.parse('2017-05-01T17:00:20')}},
    {_id: 'food-2', name: 'uovo', barcode: "8019730034010",  nutritional_values: {energy: 128}, owner: {user: {userID: 'mario rossi', _id: '612df857e9e11fd2d82cb95h'}, timestamp: Date.parse('2017-05-01T17:00:20')}},
    {_id: 'food-3', name: 'latte intero', nutritional_values: {energy: 63}, barcode: '808080', owner: {user: {userID: 'mario rossi', _id: '612df857e9e11fd2d82cb95h'}, timestamp: Date.parse('2017-05-01T17:00:20')}},
    {_id: 'food-4', name: 'farina di cocco', nutritional_values: {energy: 600}, owner: {user: {userID: 'mario rossi', _id: '612df857e9e11fd2d82cb95h'}, timestamp: Date.parse('2017-05-01T17:00:20')}},
    {_id: 'food-5', name: 'fagioli', nutritional_values: {energy: 326 }, owner: {user: {userID: 'mario rossi', _id: '612df857e9e11fd2d82cb95h'}, timestamp: Date.parse('2018-03-01T20:00:00')}},
    {_id: 'food-6', name: 'ceci', nutritional_values: {energy: 132 }, owner: {user: {userID: 'maricapasquali01', _id: '612df857e9e11fd2d82cb95f'}, timestamp: Date.parse('2017-05-01T17:00:20')}},
    {_id: 'food-7', name: 'salsiccia suino', nutritional_values: {energy: 304}, owner: {user: {userID: 'mario rossi', _id: '612df857e9e11fd2d82cb95h'}, timestamp: Date.parse('2017-05-01T17:00:20')}},
    {_id: 'food-8', name: 'carne bovina', nutritional_values: {energy: 200}, owner: {user: {userID: 'mario rossi', _id: '612df857e9e11fd2d82cb95h'}, timestamp: Date.parse('2017-05-01T17:00:20')}},
    {_id: 'food-9', name: 'olio extra vergine d\'oliva', nutritional_values: {energy: 900}, owner: {user: {userID: 'mario rossi', _id: '612df857e9e11fd2d82cb95h'}, timestamp: Date.parse('2017-05-01T17:00:20')}},
    {_id: 'food-10', name: 'farina 00', nutritional_values: {energy: 323 }, owner: {user: {userID: 'mario rossi', _id: '612df857e9e11fd2d82cb95h'}, timestamp: Date.parse('2017-05-01T17:00:20')}},
].sort((c1, c2) => c2.owner.timestamp - c1.owner.timestamp)/* -> decrescente */