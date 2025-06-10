import * as userService from '@/app/services/user.service'
import * as adminLogService from '@/app/services/admin-action-log.service'
import { db } from '@/configs'

export async function getUsers(req, res) {
    const { page = 1, per_page = 10 } = req.query 
    const result = await userService.getUsers({ page, per_page })
    res.json(result)
}

export async function getUserProfile(req, res) {
    const user = await userService.getUserProfile(req.params.id)
    res.jsonify(user)
}

export async function createUser(req, res) {
    await db.transaction(async (session) => {
        const user = await userService.createUser(req.body, session)

        await adminLogService.log(
            `Tạo tài khoản người dùng ${user.name}`,
            'User',
            user._id,
        )

        res.status(201).jsonify({
            message: 'Người dùng đã được tạo thành công.',
            data: user
        })
    })
}

export async function updateUser(req, res) {
    await db.transaction(async (session) => {
        const updatedUser = await userService.updateUserProfile(req.params.id, req.body, session)

        await adminLogService.log(
            req.currentAdmin._id,
            `Cập nhật tài khoản người dùng ${updatedUser.name}`,
            'User',
            req.params.id,
        )

        res.jsonify({
            message: 'Cập nhật thông tin người dùng thành công.',
            data: updatedUser
        })
    })
}

export async function deleteUser(req, res) {
    await db.transaction(async (session) => {
        const result = await userService.deleteUser(req.params.id, session)

        await adminLogService.log(
            req.currentAdmin._id,
            `Khóa tài khoản người dùng ${result.name}`,
            'User',
            req.params.id,
        )

        res.jsonify(result)
    })
}

export async function activateUser(req, res) {
    await db.transaction(async (session) => {
        const result = await userService.activateUser(req.params.id, session)

        await adminLogService.log(
            req.currentAdmin._id,
            `Mở khóa tài khoản người dùng ${result.name}`,
            'User',
            req.params.id,
        )

        res.jsonify(result)
    })
}

export async function getUserStatistics(req, res) {
    const stats = await userService.countUserStatistics()
    res.json(stats)
}


