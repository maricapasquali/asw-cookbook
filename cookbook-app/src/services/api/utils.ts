
export function getHeaderBearerAuthorization(token?: string): object {
    return token ? { authorization: 'Bearer ' + token } : {}
}