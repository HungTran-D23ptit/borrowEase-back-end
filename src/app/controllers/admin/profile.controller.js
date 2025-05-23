import * as userService from '@/app/services/user.service'
import { db } from '@/configs'

export async function getProfile(req, res) {
    const user = await userService.getAdminProfile(req.currentAdmin._id)
    res.jsonify(user)
}

export async function updateProfile(req, res) {
    let updatedUser
    await db.transaction(async function (session) {
        updatedUser = await userService.updateAdminProfile(req.currentAdmin._id, req.body, session)
    })
    res.jsonify({
        message: 'Cập nhật thông tin thành công',
        user: updatedUser
    })
}