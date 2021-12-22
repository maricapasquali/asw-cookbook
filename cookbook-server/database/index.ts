import * as path from "path";
import * as mongoose from "mongoose";
import * as dotenv from "dotenv"

dotenv.config({path: path.resolve('cookbook-server', '.env')})

const CONNECTION_URI: string = process.env.DB_CONNECTION || 'mongodb://localhost:27017/cookbook'
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