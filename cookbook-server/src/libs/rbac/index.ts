import {valuesOfEnum} from "../utilities";

export interface IRbac {

    /**
     * Permissions the user obtains through the assigned role
     */
    acl: RBAC.Authorization[]

    /**
     * @param role user role included in {@link RBAC.Role}
     * @param operation operation to apply to the resource ({@link RBAC.Operation})
     * @param resource resource to which to apply the operation ({@link RBAC.Resource})
     * @param others if true, the user can apply the _operation_ even if they are not the owner of the resource
     * @return true if all parameters (role, operation, resource, others?) match a record in the authorization list, otherwise false.
     */
    isAuthorized(role: string, operation: RBAC.Operation, resource: RBAC.Resource, others?: boolean): boolean
}

export interface IRbacWithRole extends IRbac {

    /**
     * @param user to check
     * @return true if _user.role_ is instance of {@link Role.SIGNED}, otherwise false.
     */
    isSignedUser(user: { _id?: string, role: string } ): boolean

    /**
     * @param user to check
     * @return true if _user.role_ is instance of {@link Role.ADMIN}, otherwise false.
     */
    isAdminUser(user: { _id?: string, role: string } ): boolean
}

/**
 * An implementation of {@link IRbacWithRole}
 */
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

    /**
     * {@link RBAC.Role} represents all the roles the user can take on the platform (only one role at a time).
     */
    export enum Role {
        ADMIN = "admin",
        SIGNED = "signed"
    }

    export namespace Role {
        /**
         * @return a list of all {@link Role}'s enumeration values.
         */
        export function values(): Role[] {
            return valuesOfEnum(Role, "string")
        }

        /**
         * @param val string to convert
         * @return a {@link Role} instance of the string _val_
         */
        export function as(val: string): Role {
            return val as Role
        }

        /**
         * @param role string to check
         * @return true if _role_ is instance of {@link Role.SIGNED}, otherwise false.
         */
        export function isSigned(role: string): boolean {
            return Role.as(role) === Role.SIGNED
        }

        /**
         * @param role string to check
         * @return true if _role_ is instance of {@link Role.ADMIN}, otherwise false.
         */
        export function isAdmin(role: string): boolean {
            return Role.as(role) === Role.ADMIN
        }
    }

    /**
     * {@link RBAC.Operation} represents all the operations the user can apply to resources (only one operation at a time).
     */
    export enum Operation {
        CREATE = "create",
        RETRIEVE = "retrieve",
        UPDATE = "update",
        DELETE = "delete"
    }

    /**
     * {@link RBAC.Resource} represents all considering resources in the platform.
     */
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

    export type Authorization = {
        /**
         *  User roles
         */
        roles: Role[],
        /**
         * Operation to apply to the resource
         */
        operation: Operation
        /**
         * Resource to which to apply the operation
         */
        resource: Resource
        /**
         * (Optional) Field that if true, the user can apply the _operation_ even if they are not the owner of the resource
         */
        others?: boolean
    }
}

/**
 * @return implementation instance of {@link IRbacWithRole}
 */
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
