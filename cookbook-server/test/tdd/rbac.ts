import {
    createRBAC,
    IRbacWithRole,
    RBAC
} from "../../src/libs/rbac"
import { assert } from "chai"

suite("RBAC", () => {
    let accessManager: IRbacWithRole
    let admin: string
    let signed: string

    suiteSetup(() => {
        accessManager = createRBAC()
        admin = RBAC.Role.ADMIN.toString()
        signed = RBAC.Role.SIGNED.toString()
    })

    suite("#isAuthorized(...)", () => {
        test("should return true when the user has role ADMIN and deletes some user", () => {
            assert(accessManager.isAuthorized(admin, RBAC.Operation.DELETE, RBAC.Resource.USER, true))
        })
        test("should return false when the user has role SIGNED and deletes users", () => {
            assert(!accessManager.isAuthorized(signed, RBAC.Operation.DELETE, RBAC.Resource.USER, true))
        })
        test("should return true when the user has role SIGNED and deletes his account", () => {
            assert(accessManager.isAuthorized(signed, RBAC.Operation.DELETE, RBAC.Resource.USER, false))
        })
        test("should return true when the user has role SIGNED and deletes his account", () => {
            assert(accessManager.isAuthorized(signed, RBAC.Operation.DELETE, RBAC.Resource.USER))
        })
    })

    suite("#isSignedUser(..)", () => {
        test("should return true when the user has role SIGNED", () => {
            assert(accessManager.isSignedUser({ role: signed }))
        })
        test("should return false when the user has role different from SIGNED", () => {
            assert(!accessManager.isSignedUser({ role: admin }))
        })
    })

    suite("#isAdminUser(..)", () => {
        test("should return true when the user has role ADMIN", () => {
            assert(accessManager.isAdminUser({ role: admin }))
        })
        test("should return false when the user has role different from ADMIN", () => {
            assert(!accessManager.isAdminUser({ role: signed }))
        })
    })
})
