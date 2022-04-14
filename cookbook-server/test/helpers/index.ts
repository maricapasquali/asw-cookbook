import {Types} from "mongoose";
import * as env from "../../../environment/env.config";
import {connect, disconnect, drop} from "../../database"

/* -- EXPORTED FUNCTIONALITY -- */
export const SECOND_IN_MS: number = 1000

export const MINUTE_IN_SEC: number = 60

export const MINUTE_IN_MS: number = MINUTE_IN_SEC * SECOND_IN_MS

export const TIMEOUT_DATABASE: number = 100000

export const connectDatabase = connect

export const disconnectDatabase = disconnect

export const dropDatabase = drop

export const ObjectId = Types.ObjectId

export const isTestingMode = env.mode === "test"

export const sleep = (seconds: number): Promise<void> => new Promise(resolve => setTimeout(resolve, seconds * SECOND_IN_MS))

export const sleepMills = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

export const convertInSeconds = (minutes: number) : number => minutes * MINUTE_IN_SEC
