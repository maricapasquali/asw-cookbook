/**
 * {@link Mode} represents all the ways of building the application.
 */
export enum Mode {
    PRODUCTION = "production",
    DEVELOPMENT = "development",
    TEST = "test"
}

export function isDevelopmentMode(mode: string): boolean {
    return mode as Mode === Mode.DEVELOPMENT
}

export function isTestMode(mode: string): boolean {
    return mode as Mode === Mode.TEST
}

export function isProductionMode(mode: string): boolean {
    return mode as Mode === Mode.PRODUCTION
}