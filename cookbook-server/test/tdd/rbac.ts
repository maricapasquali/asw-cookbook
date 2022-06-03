import {RBAC, createRBAC, IRbacWithRole} from "../../src/libs/rbac"
import {assert} from "chai"

suite('RBAC', function () {
    let accessManager: IRbacWithRole
    let admin: string
    let signed: string

    suiteSetup(function () {
        accessManager = createRBAC()
        admin = RBAC.Role.ADMIN.toString()
        signed = RBAC.Role.SIGNED.toString()
    });

    suite("#isAuthorized(...)", function () {

        test('should return true when the user has role ADMIN and deletes some user', function() {
            assert(accessManager.isAuthorized(admin, RBAC.Operation.DELETE, RBAC.Resource.USER, true))
        })
        test('should return false when the user has role SIGNED and deletes users', function() {
            assert(!accessManager.isAuthorized(signed, RBAC.Operation.DELETE, RBAC.Resource.USER, true))
        })
        test('should return true when the user has role SIGNED and deletes his account', function() {
            assert(accessManager.isAuthorized(signed, RBAC.Operation.DELETE, RBAC.Resource.USER, false))
        })
        test('should return true when the user has role SIGNED and deletes his account', function() {
            assert(accessManager.isAuthorized(signed, RBAC.Operation.DELETE, RBAC.Resource.USER))
        })
    });

    suite("#isSignedUser(..)", function (){
        test("should return true when the user has role SIGNED", function (){
            assert(accessManager.isSignedUser({role: signed}))
        })
        test("should return false when the user has role different from SIGNED", function (){
            assert(!accessManager.isSignedUser({role: admin}))
        })
    })

    suite("#isAdminUser(..)", function (){
        test("should return true when the user has role ADMIN", function (){
            assert(accessManager.isAdminUser({role: admin}))
        })
        test("should return false when the user has role different from ADMIN", function (){
            assert(!accessManager.isAdminUser({role: signed}))
        })
    })
});
