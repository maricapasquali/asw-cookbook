import "../../src/libs/@global"

import { Types } from "mongoose"
import {
    connect,
    disconnect,
    drop
} from "../../src/database"
import { isTestMode } from "cookbook-shared/environment/mode"

/* -- EXPORTED FUNCTIONALITY -- */
export const SECOND_IN_MS = 1000

export const MINUTE_IN_SEC = 60

export const MINUTE_IN_MS: number = MINUTE_IN_SEC * SECOND_IN_MS

export const TIMEOUT_DATABASE = 100000

export const connectDatabase = connect

export const disconnectDatabase = disconnect

export const dropDatabase = drop

export const ObjectId = Types.ObjectId

export const isTestingMode = isTestMode(configuration.mode)

export function sleep(seconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, seconds * SECOND_IN_MS))
}

export function sleepMills(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export function convertInSeconds(minutes: number): number {
    return minutes * MINUTE_IN_SEC
}
