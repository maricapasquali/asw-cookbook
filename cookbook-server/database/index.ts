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

export function connect(): void {
    mongoose.connect(CONNECTION_URI, CONNECTION_OPTIONS, () => console.log('Database is connected.'));
}

export function disconnect(): void {
    mongoose.disconnect(() => console.log('Database is disconnected.'))
}