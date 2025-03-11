import * as roleMiddleware from '@/app/middleware/admin/role.middleware'
import * as roleRequest from '@/app/requests/admin/role.request'
import * as roleController from '@/app/controllers/admin/role.controller'
import * as authMiddleware from '@/app/middleware/admin/auth.middleware'
import {asyncHandler} from '@/utils/helpers'
import {Router} from 'express'
import validate from '@/app/middleware/admin/validate'

const roleRouter = Router()

roleRouter.use(asyncHandler(authMiddleware.checkValidToken))

roleRouter.get(
    '/',
    asyncHandler(roleController.readRoot),
)

roleRouter.get(
    '/permission-types',
    asyncHandler(roleController.readPermissionTypes)
)

roleRouter.post(
    '/',
    asyncHandler(validate(roleRequest.createItem)),
    asyncHandler(roleController.createItem)
)

roleRouter.put(
    '/:roleId',
    asyncHandler(roleMiddleware.checkRoleId),
    roleMiddleware.canUpdate,
    asyncHandler(validate(roleRequest.updateItem)),
    asyncHandler(roleController.updateItem)
)

roleRouter.delete(
    '/:roleId',
    asyncHandler(roleMiddleware.checkRoleId),
    roleMiddleware.canDelete,
    asyncHandler(roleController.deleteItem)
)

roleRouter.get(
    '/:roleId/permissions',
    asyncHandler(roleMiddleware.checkRoleId),
    asyncHandler(roleController.readPermissionsOfRole)
)

roleRouter.patch(
    '/:roleId/update-permission-for-role/:permissionId',
    asyncHandler(roleMiddleware.checkRoleId),
    roleMiddleware.canUpdate,
    asyncHandler(roleMiddleware.checkPermissionId),
    asyncHandler(roleController.switchPermissionOfRole)
)

roleRouter.get(
    '/:roleId/accounts',
    asyncHandler(roleMiddleware.checkRoleId),
    asyncHandler(validate(roleRequest.readAccounts)),
    asyncHandler(roleController.readAccountsWithRole)
)

roleRouter.get(
    '/:roleId/accounts-without-role',
    asyncHandler(roleMiddleware.checkRoleId),
    asyncHandler(validate(roleRequest.readAccounts)),
    asyncHandler(roleController.readAccountsWithoutRole)
)

roleRouter.patch(
    '/:roleId/add-accounts',
    asyncHandler(roleMiddleware.checkRoleId),
    roleMiddleware.canUpdate,
    asyncHandler(validate(roleRequest.addAccountsForRole)),
    asyncHandler(roleController.addAccountsForRole)
)

roleRouter.delete(
    '/:roleId/delete-account-in-role/:accountId',
    asyncHandler(roleMiddleware.checkRoleId),
    roleMiddleware.canUpdate,
    asyncHandler(roleMiddleware.checkAccountId),
    asyncHandler(roleController.deleteAccountInRole)
)

export default roleRouter
