import * as mongoose from "mongoose";
import * as config from "../../environment/env.config";

let CONNECTION_URI: string = config.database.uri
//console.log(CONNECTION_URI)

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

export function dropDatabase(): Promise<void> {
    return mongoose.connection.db?.dropDatabase() || new Promise<any>((resolve, reject) => reject(new mongoose.Error("No Connection on a database.")))
}
