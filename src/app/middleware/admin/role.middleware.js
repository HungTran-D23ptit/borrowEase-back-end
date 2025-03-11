import {Admin, Permission, Role} from '@/models'
import {abort} from '@/utils/helpers'
import {isValidObjectId} from 'mongoose'

export async function checkRoleId(req, res, next) {
    if (isValidObjectId(req.params.roleId)) {
        const role = await Role.findById(req.params.roleId)
        if (role) {
            req.role = role
            next()
            return
        }
    }
    abort(404, 'Không tìm thấy vai trò.')
}
export function canUpdate(req, res, next) {
    if (!req.role.can_edit) {
        abort(403, 'Không thể chỉnh sửa vai trò này.')
    }
    next()
}
export function canDelete(req, res, next) {
    if (!req.role.can_delete) {
        abort(403, 'Không thể xóa vai trò này.')
    }
    next()
}
export async function checkPermissionId(req, res, next) {
    if (isValidObjectId(req.params.permissionId)) {
        const permission = await Permission.findById(req.params.permissionId)
        if (permission) {
            req.permission = permission
            next()
            return
        }
    }
    abort(404, 'Không tìm thấy quyền hạn.')
}
export async function checkAccountId(req, res, next) {
    if (isValidObjectId(req.params.accountId)) {
        const account = await Admin.findById({_id: req.params.accountId, deleted: false})
        if (account) {
            req.account = account
            next()
            return
        }
    }
    abort(404, 'Không tìm thấy người dùng.')
}
