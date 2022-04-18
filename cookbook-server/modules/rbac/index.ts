export interface IRbac {
    acl: RBAC.Authorization[]
    isAuthorized(role: string, operation: RBAC.Operation, resource: RBAC.Resource, others?: boolean): boolean
}

export interface IRbacWithRole extends IRbac {
    isSignedUser(user: { _id?: string, role: string } ): boolean
    isAdminUser(user: { _id?: string, role: string } ): boolean
}

export class RBAC implements IRbacWithRole {
    private readonly accessControlList: RBAC.Authorization[]

    constructor(accessControlList: RBAC.Authorization[]) {
        this.accessControlList = accessControlList
    }

    get acl(): RBAC.Authorization[] {
        return this.accessControlList
    }

    isAuthorized(role: string, operation: RBAC.Operation, resource: RBAC.Resource, others?: boolean): boolean {
        others = others || undefined
        return this.accessControlList.find(auth => auth.roles.includes(RBAC.Role.as(role)) && auth.operation === operation && auth.resource === resource && auth.others == others) !== undefined ;
    }

    isSignedUser(user: {_id?: string, role: string} ): boolean {
        return user && RBAC.Role.isSigned(user.role);
    }

    isAdminUser(user: {_id?: string, role: string} ): boolean{
        return user && RBAC.Role.isAdmin(user.role);
    }
}

export namespace RBAC {

    export enum Role {
        ADMIN = "admin",
        SIGNED = "signed"
    }

    export namespace Role {
        export function values(): Array<Role> {
            return Object.entries(Role).filter(([k, v]) => typeof v === 'string').map(([k, v]) => Role[k])
        }

        export function as(val: string): Role {
            return val as Role
        }

        export function isSigned(role: string): boolean {
            return Role.as(role) === Role.SIGNED
        }

        export function isAdmin(role: string): boolean {
            return Role.as(role) === Role.ADMIN
        }
    }

    export enum Operation {
        CREATE = "create",
        RETRIEVE = "retrieve",
        UPDATE = "update",
        DELETE= "delete"
    }

    export enum Resource {
        USER = "user",
        USER_CREDENTIAL = "user_credential",
        SESSION = "session",
        FRIEND = "friendship",
        FOOD = "food",
        SHOPPING_LIST = "shopping_list",
        SHOPPING_LIST_POINT = "shopping_list_point",
        RECIPE = "recipe",
        LIKE = "like",
        COMMENT = "comment",
        COMMENT_REPORT = "comment_report",
        NOTIFICATION = "notification",
        CHAT = "chat",
        MESSAGE = "message"
    }

    export interface Authorization {
        roles: Array<Role>,
        operation: Operation
        resource: Resource
        others?: boolean
    }
}

export function createRBAC(): IRbacWithRole {

    const Role = RBAC.Role
    const Operation = RBAC.Operation
    const Resource = RBAC.Resource

    return new RBAC([
        { roles: [Role.ADMIN], operation: Operation.DELETE, resource: Resource.USER, others: true },
        { roles: [Role.SIGNED], operation: Operation.DELETE, resource: Resource.USER },
        { roles: [Role.ADMIN, Role.SIGNED], operation: Operation.UPDATE, resource: Resource.USER },

        { roles: [Role.ADMIN, Role.SIGNED], operation: Operation.DELETE, resource: Resource.SESSION },
        { roles: [Role.ADMIN, Role.SIGNED], operation: Operation.UPDATE, resource: Resource.SESSION },

        { roles: [Role.ADMIN, Role.SIGNED], operation: Operation.UPDATE, resource: Resource.USER_CREDENTIAL },

        { roles: [Role.ADMIN, Role.SIGNED], operation: Operation.CREATE, resource: Resource.FOOD },
        { roles: [Role.SIGNED], operation: Operation.UPDATE, resource: Resource.FOOD },
        { roles: [Role.ADMIN], operation: Operation.UPDATE, resource: Resource.FOOD, others: true },

        { roles: [Role.SIGNED], operation: Operation.CREATE, resource: Resource.SHOPPING_LIST },
        { roles: [Role.SIGNED], operation: Operation.RETRIEVE, resource: Resource.SHOPPING_LIST },
        { roles: [Role.SIGNED], operation: Operation.CREATE, resource: Resource.SHOPPING_LIST_POINT },
        { roles: [Role.SIGNED], operation: Operation.UPDATE, resource: Resource.SHOPPING_LIST_POINT },
        { roles: [Role.SIGNED], operation: Operation.DELETE, resource: Resource.SHOPPING_LIST_POINT },

        { roles: [Role.SIGNED], operation: Operation.CREATE, resource: Resource.RECIPE },
        { roles: [Role.SIGNED], operation: Operation.UPDATE, resource: Resource.RECIPE },
        { roles: [Role.SIGNED], operation: Operation.DELETE, resource: Resource.RECIPE },
        { roles: [Role.SIGNED], operation: Operation.RETRIEVE, resource: Resource.RECIPE },

        { roles: [Role.SIGNED], operation: Operation.CREATE, resource: Resource.LIKE },
        { roles: [Role.SIGNED], operation: Operation.DELETE, resource: Resource.LIKE },

        { roles: [Role.SIGNED], operation: Operation.CREATE, resource: Resource.COMMENT},
        { roles: [Role.ADMIN], operation: Operation.RETRIEVE, resource: Resource.COMMENT, others: true },
        { roles: [Role.ADMIN], operation: Operation.DELETE, resource: Resource.COMMENT, others: true},
        { roles: [Role.SIGNED], operation: Operation.DELETE, resource: Resource.COMMENT },
        { roles: [Role.SIGNED], operation: Operation.UPDATE, resource: Resource.COMMENT },

        { roles: [Role.SIGNED], operation: Operation.CREATE, resource: Resource.COMMENT_REPORT},
        { roles: [Role.ADMIN], operation: Operation.DELETE, resource: Resource.COMMENT_REPORT, others: true },

        { roles: [Role.SIGNED], operation: Operation.CREATE, resource: Resource.FRIEND },
        { roles: [Role.SIGNED], operation: Operation.RETRIEVE, resource: Resource.FRIEND },
        { roles: [Role.ADMIN], operation: Operation.RETRIEVE, resource: Resource.FRIEND, others: true },
        { roles: [Role.SIGNED], operation: Operation.UPDATE, resource: Resource.FRIEND },
        { roles: [Role.SIGNED], operation: Operation.DELETE, resource: Resource.FRIEND },

        { roles: [Role.SIGNED, Role.ADMIN], operation: Operation.RETRIEVE, resource: Resource.NOTIFICATION },
        { roles: [Role.SIGNED, Role.ADMIN], operation: Operation.UPDATE, resource: Resource.NOTIFICATION },
        { roles: [Role.SIGNED, Role.ADMIN], operation: Operation.DELETE, resource: Resource.NOTIFICATION },

        { roles: [Role.SIGNED, Role.ADMIN], operation: Operation.CREATE, resource: Resource.CHAT },
        { roles: [Role.SIGNED, Role.ADMIN], operation: Operation.RETRIEVE, resource: Resource.CHAT },
        { roles: [Role.SIGNED, Role.ADMIN], operation: Operation.DELETE, resource: Resource.CHAT },
        { roles: [Role.SIGNED, Role.ADMIN], operation: Operation.UPDATE, resource: Resource.CHAT },

        { roles: [Role.SIGNED, Role.ADMIN], operation: Operation.CREATE, resource: Resource.MESSAGE },
        { roles: [Role.SIGNED, Role.ADMIN], operation: Operation.UPDATE, resource: Resource.MESSAGE },
        { roles: [Role.SIGNED, Role.ADMIN], operation: Operation.RETRIEVE, resource: Resource.MESSAGE },
    ])
}
