import * as roleService from '@/app/services/role.service'
import {db} from '@/configs'

export async function readRoot(req, res) {
    const data = await roleService.treeData()
    res.jsonify(data)
}
export async function readPermissionTypes(req, res) {
    const result = await roleService.listPermissionType()
    res.jsonify(result)
}
export async function createItem(req, res) {
    await db.transaction(async function (session) {
        await roleService.create(session, req.body)
        res.status(201).jsonify()
    })
}
export async function updateItem(req, res) {
    await db.transaction(async function (session) {
        await roleService.update(session, req.role, req.body)
        res.status(201).jsonify()
    })
}
export async function deleteItem(req, res) {
    await db.transaction(async function (session) {
        await roleService.deleteRoleWithChildren(session, req.role)
        res.jsonify()
    })
}
export async function readPermissionsOfRole(req, res) {
    const data = await roleService.getPermissionOfRole(req.role)
    res.jsonify(data)
}
export async function switchPermissionOfRole(req, res) {
    await db.transaction(async function (session) {
        await roleService.switchPermission(session, req.role, req.permission)
        res.status(201).jsonify()
    })
}
export async function readAccountsWithRole(req, res) {
    const data = await roleService.readAccounts(req.role, true, req.query)
    res.jsonify(data)
}
export async function readAccountsWithoutRole(req, res) {
    const data = await roleService.readAccounts(req.role, false, req.query)
    res.jsonify(data)
}
export async function addAccountsForRole(req, res) {
    await db.transaction(async function (session) {
        await roleService.addAccountsForRole(session, req.role, req.body.account_ids)
        res.status(201).jsonify()
    })
}
export async function deleteAccountInRole(req, res) {
    await db.transaction(async function (session) {
        await roleService.deleteAccountsInRole(session, req.role, req.account)
        res.status(201).jsonify()
    })
}
