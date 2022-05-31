import * as mongoose from "mongoose";

let CONNECTION_URI: string = configuration.database.uri
//console.debug(CONNECTION_URI)

const CONNECTION_OPTIONS: object = {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true
}

export function connect(): Promise<any> {
    return mongoose.connect(CONNECTION_URI, CONNECTION_OPTIONS)
}

export function disconnect(): Promise<void> {
    return mongoose.disconnect()
}

export function drop(): Promise<void> {
    return mongoose.connection.db?.dropDatabase() || new Promise<any>((resolve, reject) => reject(new mongoose.Error("No Connection on a database.")))
}
