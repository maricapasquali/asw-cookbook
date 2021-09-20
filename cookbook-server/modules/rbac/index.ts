export interface IRbac {
    isAuthorized(role: string, operation: RBAC.Operation, subject: RBAC.Subject, others?: boolean): boolean
    isSignedUser(user: { _id?: string, role: string } ): boolean
    isAdminUser(user: { _id?: string, role: string } ): boolean
}

export class RBAC implements IRbac {
    private readonly authorizations: Array<RBAC.Authorization>
    constructor() {
        this.authorizations = [
            { roles: [RBAC.Role.ADMIN], operation: RBAC.Operation.DELETE, subject: RBAC.Subject.USER, others: true },
            { roles: [RBAC.Role.SIGNED], operation: RBAC.Operation.DELETE, subject: RBAC.Subject.USER },
            { roles: [RBAC.Role.ADMIN, RBAC.Role.SIGNED], operation: RBAC.Operation.UPDATE, subject: RBAC.Subject.USER },
            { roles: [RBAC.Role.ADMIN, RBAC.Role.SIGNED], operation: RBAC.Operation.DELETE, subject: RBAC.Subject.SESSION },
            { roles: [RBAC.Role.ADMIN, RBAC.Role.SIGNED], operation: RBAC.Operation.UPDATE, subject: RBAC.Subject.SESSION },
            { roles: [RBAC.Role.ADMIN, RBAC.Role.SIGNED], operation: RBAC.Operation.UPDATE, subject: RBAC.Subject.USER_CREDENTIAL },
        ]
    }

    isAuthorized(role: string, operation: RBAC.Operation, subject: RBAC.Subject, others?: boolean): boolean {
        others = others || undefined
        return this.authorizations.find(auth => auth.roles.includes(role as RBAC.Role) && auth.operation === operation && auth.subject === subject && auth.others == others) !== undefined ;
    }

    isSignedUser(user: {_id?: string, role: string} ): boolean {
        return user && user.role as RBAC.Role === RBAC.Role.SIGNED;
    }
    isAdminUser(user: {_id?: string, role: string} ): boolean{
        return user && user.role as RBAC.Role === RBAC.Role.ADMIN;
    }
}

export namespace RBAC{
    export enum Role{ADMIN = 'admin', SIGNED = 'signed'}
    export enum Operation{CREATE, RETRIEVE, UPDATE, DELETE}
    export enum Subject{USER, USER_CREDENTIAL, SESSION}

    export interface Authorization {
        roles: Array<Role>,
        operation: Operation
        subject: Subject
        others?: boolean
    }
}