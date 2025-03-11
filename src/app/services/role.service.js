import {Admin, PERMISSION, Permission, PermissionGroup, PermissionType, Role} from '@/models'
import _ from 'lodash'

export async function treeData() {
    const roles = await Role.find().sort({_id: 1}).select({
        permission_ids: 0,
        account_ids: 0,
        school_account_ids: 0,
        created_at: 0,
        updated_at: 0,
    })
    function dfs(parentId = null) {
        const result = roles.filter(({parent_id}) => (parent_id ? parent_id.equals(parentId) : !parentId))
        result.forEach(function (item) {
            const children = dfs(item._id)
            if (!_.isEmpty(children)) {
                item.children = children
            }
        })
        return result
    }
    return dfs()
}
export async function listPermissionType() {
    const result = await PermissionType.find().sort({position: 1}).select('-created_at -updated_at').lean()
    return result
}
export async function create(session, requestBody) {
    const role = new Role(requestBody)
    await role.save({session})
    return role
}
export async function update(session, role, requestBody) {
    for (const [key, value] of Object.entries(requestBody)) {
        role[key] = value
    }
    await role.save({session})
    return role
}
export async function deleteRoleWithChildren(session, role) {
    async function findDescendants(roleId) {
        const descendants = await Role.find({parent_id: roleId}).distinct('_id').session(session)
        for (const rId of descendants) {
            const children = await findDescendants(rId)
            descendants.push(...children)
        }
        return descendants
    }

    const descendants = await findDescendants(role._id)
    descendants.push(role._id)

    await Role.deleteMany({_id: {$in: descendants}}, {session})
}
export async function getPermissionOfRole(role) {
    const [isSuperAdmin, permissions, permissionTypes, permissionGroups] = await Promise.all([
        Permission.findOne({_id: {$in: role.permission_ids}, code: PERMISSION.SUPER_ADMIN}),
        Permission.find().select('-created_at -updated_at'),
        PermissionType.find().sort({position: 1, _id: 1}).select('-created_at -updated_at'),
        PermissionGroup.find().sort({position: 1, _id: 1}).select('-created_at -updated_at'),
    ])
    const permission = {}
    function dfs(parentCode = null) {
        const result = permissionGroups.filter(({parent_code}) => parent_code ? parent_code === parentCode : !parentCode)
        result.forEach(function (item) {
            const types = {}
            permissionTypes.forEach(function (type) {
                types[type.code] = permissions.find(
                    ({permission_group_code, permission_type_code}) =>
                        permission_group_code === item.code && permission_type_code === type.code
                )
                if (types[type.code]) {
                    permission[types[type.code]._id] = isSuperAdmin
                        ? true
                        : role.permission_ids.some((id) => id.equals(types[type.code]._id))
                }
            })
            item.types = types
            const children = dfs(item.code)
            if (!_.isEmpty(children)) {
                item.children = children
            }
        })

        return result
    }
    const result = dfs()

    return {permission_groups: result, permission}
}
export async function switchPermission(session, role, permission) {
    const hasPermission = role.permission_ids.some((id) => id.equals(permission._id))
    if (hasPermission) {
        role.permission_ids = role.permission_ids.filter((id) => !id.equals(permission._id))
    } else {
        role.permission_ids.push(permission._id)
    }
    await role.save({session})
}
export async function readAccounts(role, withRole = true, {q, page, per_page}) {
    if (withRole) {
        const result = await Admin.find({deleted: false, _id: {$in: role.account_ids}}, {name: 1, phone: 1})
            .sort({_id: -1})
            .lean()
        return result
    } else {
        q = q ? {$regex: q, $options: 'i'} : null
        const filter = {
            deleted: false,
            is_protected: false,
            _id: {$nin: role.account_ids},
            ...(q && {$or: [{name: q}, {phone: q}]}),
        }
        const accounts = await Admin.find(filter, {name: 1, phone: 1})
            .sort({_id: -1})
            .skip((page - 1) * per_page)
            .limit(per_page)
            .lean()
        const total = await Admin.countDocuments(filter)
        return {total, page, per_page, items: accounts}
    }
}
export async function addAccountsForRole(session, role, accountIds) {
    await Role.findByIdAndUpdate(role._id, {$addToSet: {account_ids: accountIds}}, {session})
}
export async function deleteAccountsInRole(session, role, admin) {
    await Role.findByIdAndUpdate(role._id, {$pull: {account_ids: admin._id}}, {session})
}
