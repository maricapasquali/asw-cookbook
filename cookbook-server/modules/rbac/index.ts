export interface IRbac {
    isAuthorized(user: { _id: string, role: string } | any, identifier: string, operation: RBAC.Operation, subject: string): boolean
    isSignedUser(user: { _id?: string, role: string } ): boolean
    isAdminUser(user: { _id?: string, role: string } ): boolean
}

export class RBAC implements IRbac{
    private readonly admin = 'admin'
    private readonly signed = 'signed'
    private readonly roles;

    constructor() {
        this.roles = [this.admin, this.signed];
    }

    isAuthorized(user: {_id: string, role: string} | any, identifier: string, operation: RBAC.Operation, subject: string): boolean {
        if(!user) return false
        if(!user._id || !user.role) return false
        switch (subject){
            case 'user': {
                switch (operation){
                    case RBAC.Operation.DELETE:
                        return user.role === this.admin || (user.role === this.signed && user._id === identifier)
                    case RBAC.Operation.UPDATE:
                        return this.roles.includes(user.role) && user._id === identifier
                }
            }
            break
            case 'user_credential':{
                switch (operation){
                    case RBAC.Operation.UPDATE:
                        return this.roles.includes(user.role) && user._id === identifier
                }
            }break;
            case 'session':{
                switch (operation){
                    case RBAC.Operation.DELETE:
                        return this.roles.includes(user.role) && user._id === identifier
                    case RBAC.Operation.UPDATE:
                        return this.roles.includes(user.role) && user._id === identifier
                }

            }break;
        }
        throw new Error(subject + ' not implemented')
    }

    isSignedUser(user: {_id?: string, role: string} ): boolean {
        return user && user.role === this.signed;
    }
    isAdminUser(user: {_id?: string, role: string} ): boolean{
        return user && user.role === this.admin;
    }
}

export namespace RBAC{
    export enum Operation{CREATE, RETRIEVE, UPDATE, DELETE}
}