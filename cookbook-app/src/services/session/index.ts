export interface ISession{
    userInfo(): UserInfo
    setUserInfo(info: UserInfo): void
    changeUserID(val: string): void

    accessToken(): string,
    refreshToken(): string,
    setAccessToken(aToken: string): void
    setRefreshToken(rToken: string): void
    start(tokens: Tokens, userInfo?: UserInfo): void
    end(): void
    isStart(): boolean
}

type UserInfo = {_id: string, userID: string, isSigned?: boolean, isAdmin?: boolean}
type Tokens = {access: string, refresh: string}

class SessionImpl implements ISession {
    private tokens: Tokens = {
        access: window.localStorage.getItem('token.access'),
        refresh: window.localStorage.getItem('token.refresh')
    }
    private _userInfo: UserInfo

    userInfo(): UserInfo {
        if(!this._userInfo) this._userInfo = JSON.parse(window.localStorage.getItem('user.info'))
        return this._userInfo
    }

    setUserInfo(info: UserInfo): void {
        this._userInfo = info
        window.localStorage.setItem('user.info', JSON.stringify(info))
    }

    changeUserID(val: string): void {
        if(!this._userInfo) this._userInfo = JSON.parse(window.localStorage.getItem('user.info'))
        this._userInfo.userID = val
        window.localStorage.setItem('user.info', JSON.stringify(this._userInfo))
    }

    accessToken(): string {
        if(!this.tokens.access) this.tokens.access = window.localStorage.getItem('token.access')
        return this.tokens.access;
    }

    refreshToken(): string {
        if(!this.tokens.refresh) this.tokens.refresh = window.localStorage.getItem('token.refresh')
        return this.tokens.refresh;
    }

    setAccessToken(aToken: string): void {
        this.tokens.access = aToken
        window.localStorage.setItem('token.access', aToken)
    }

    setRefreshToken(rToken: string): void {
        this.tokens.refresh = rToken
        window.localStorage.setItem('token.refresh', rToken)
    }

    start(tokens: Tokens, userInfo?: UserInfo): void {
       this.setAccessToken(tokens.access)
       this.setRefreshToken(tokens.refresh)
       this.setUserInfo(userInfo)
    }

    isStart(): boolean {
        return this.tokens.access !== null && this.tokens.refresh !== null;
    }

    end(): void {
        window.localStorage.removeItem('token.access')
        window.localStorage.removeItem('token.refresh')
        window.localStorage.removeItem('user.info')
        this.tokens.access = null
        this.tokens.refresh = null
        this._userInfo = null
    }

}

export const Session: ISession = new SessionImpl();