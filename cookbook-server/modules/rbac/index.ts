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

            { roles: [RBAC.Role.ADMIN, RBAC.Role.SIGNED], operation: RBAC.Operation.CREATE, subject: RBAC.Subject.FOOD },
            { roles: [RBAC.Role.SIGNED], operation: RBAC.Operation.UPDATE, subject: RBAC.Subject.FOOD },
            { roles: [RBAC.Role.ADMIN], operation: RBAC.Operation.UPDATE, subject: RBAC.Subject.FOOD, others: true },

            { roles: [RBAC.Role.SIGNED], operation: RBAC.Operation.CREATE, subject: RBAC.Subject.SHOPPING_LIST },
            { roles: [RBAC.Role.SIGNED], operation: RBAC.Operation.RETRIEVE, subject: RBAC.Subject.SHOPPING_LIST },
            { roles: [RBAC.Role.SIGNED], operation: RBAC.Operation.CREATE, subject: RBAC.Subject.SHOPPING_LIST_POINT },
            { roles: [RBAC.Role.SIGNED], operation: RBAC.Operation.UPDATE, subject: RBAC.Subject.SHOPPING_LIST_POINT },
            { roles: [RBAC.Role.SIGNED], operation: RBAC.Operation.DELETE, subject: RBAC.Subject.SHOPPING_LIST_POINT },

            { roles: [RBAC.Role.SIGNED], operation: RBAC.Operation.CREATE, subject: RBAC.Subject.RECIPE },
            { roles: [RBAC.Role.SIGNED], operation: RBAC.Operation.UPDATE, subject: RBAC.Subject.RECIPE },
            { roles: [RBAC.Role.SIGNED], operation: RBAC.Operation.DELETE, subject: RBAC.Subject.RECIPE },
            { roles: [RBAC.Role.SIGNED], operation: RBAC.Operation.RETRIEVE, subject: RBAC.Subject.RECIPE },

            { roles: [RBAC.Role.SIGNED], operation: RBAC.Operation.CREATE, subject: RBAC.Subject.LIKE },
            { roles: [RBAC.Role.SIGNED], operation: RBAC.Operation.DELETE, subject: RBAC.Subject.LIKE },

            { roles: [RBAC.Role.SIGNED], operation: RBAC.Operation.CREATE, subject: RBAC.Subject.COMMENT},
            { roles: [RBAC.Role.ADMIN], operation: RBAC.Operation.RETRIEVE, subject: RBAC.Subject.COMMENT, others: true },
            { roles: [RBAC.Role.ADMIN], operation: RBAC.Operation.DELETE, subject: RBAC.Subject.COMMENT, others: true},
            { roles: [RBAC.Role.SIGNED], operation: RBAC.Operation.DELETE, subject: RBAC.Subject.COMMENT },
            { roles: [RBAC.Role.SIGNED], operation: RBAC.Operation.UPDATE, subject: RBAC.Subject.COMMENT },

            { roles: [RBAC.Role.SIGNED], operation: RBAC.Operation.CREATE, subject: RBAC.Subject.COMMENT_REPORT},
            { roles: [RBAC.Role.ADMIN], operation: RBAC.Operation.DELETE, subject: RBAC.Subject.COMMENT_REPORT, others: true },

            { roles: [RBAC.Role.SIGNED], operation: RBAC.Operation.CREATE, subject: RBAC.Subject.FRIEND },
            { roles: [RBAC.Role.SIGNED], operation: RBAC.Operation.RETRIEVE, subject: RBAC.Subject.FRIEND },
            { roles: [RBAC.Role.SIGNED], operation: RBAC.Operation.UPDATE, subject: RBAC.Subject.FRIEND },
            { roles: [RBAC.Role.SIGNED], operation: RBAC.Operation.DELETE, subject: RBAC.Subject.FRIEND },

            { roles: [RBAC.Role.SIGNED, RBAC.Role.ADMIN], operation: RBAC.Operation.RETRIEVE, subject: RBAC.Subject.NOTIFICATION },
            { roles: [RBAC.Role.SIGNED, RBAC.Role.ADMIN], operation: RBAC.Operation.UPDATE, subject: RBAC.Subject.NOTIFICATION },
            { roles: [RBAC.Role.SIGNED, RBAC.Role.ADMIN], operation: RBAC.Operation.DELETE, subject: RBAC.Subject.NOTIFICATION },

            { roles: [RBAC.Role.SIGNED, RBAC.Role.ADMIN], operation: RBAC.Operation.CREATE, subject: RBAC.Subject.CHAT },
            { roles: [RBAC.Role.SIGNED, RBAC.Role.ADMIN], operation: RBAC.Operation.RETRIEVE, subject: RBAC.Subject.CHAT },
            { roles: [RBAC.Role.SIGNED, RBAC.Role.ADMIN], operation: RBAC.Operation.DELETE, subject: RBAC.Subject.CHAT },
            { roles: [RBAC.Role.SIGNED, RBAC.Role.ADMIN], operation: RBAC.Operation.UPDATE, subject: RBAC.Subject.CHAT },

            { roles: [RBAC.Role.SIGNED, RBAC.Role.ADMIN], operation: RBAC.Operation.CREATE, subject: RBAC.Subject.MESSAGE },
            { roles: [RBAC.Role.SIGNED, RBAC.Role.ADMIN], operation: RBAC.Operation.UPDATE, subject: RBAC.Subject.MESSAGE },
            { roles: [RBAC.Role.SIGNED, RBAC.Role.ADMIN], operation: RBAC.Operation.RETRIEVE, subject: RBAC.Subject.MESSAGE },
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
    export namespace Role {
        export function value(): Array<Role>{
            return [Role.SIGNED, Role.ADMIN]
        }
    }
    export enum Operation{CREATE, RETRIEVE, UPDATE, DELETE}
    export enum Subject{
        USER, USER_CREDENTIAL, SESSION, FRIEND,
        FOOD, SHOPPING_LIST, SHOPPING_LIST_POINT,
        RECIPE, LIKE,
        COMMENT, COMMENT_REPORT,
        NOTIFICATION,
        CHAT, MESSAGE
    }

    export interface Authorization {
        roles: Array<Role>,
        operation: Operation
        subject: Subject
        others?: boolean
    }
}