import { abort, getToken } from '@/utils/helpers'
import * as authService from '@/app/services/auth.service'
import { db } from '@/configs'

export async function login(req, res) {
    const validLogin = await authService.checkValidLoginUser(req.body)

    if (validLogin) {
        res.jsonify(authService.authTokenUser(validLogin))
    } else {
        abort(400, 'Email hoặc mật khẩu không đúng.')
    }
}

export async function logout(req, res) {
    const token = getToken(req.headers)
    await authService.blockToken(token)
    res.jsonify('Đăng xuất thành công.')
}

export async function register(req, res) {
    let user
    await db.transaction(async function (session) {
        user = await authService.registerUser(req.body, session)
    })
    res.jsonify({
        message: 'Đăng ký tài khoản thành công',
        user
    })
}

export async function loginWithGoogle(req, res) {
    const { id_token } = req.body
    const result = await authService.handleLoginWithGoogle(id_token)
    res.jsonify(result)
}

export async function changePassword(req, res) {
    const userId = req.currentUser._id
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
        abort(400, 'Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới.')
    }

    await authService.changePassword(userId, currentPassword, newPassword)
    res.jsonify({ message: 'Đổi mật khẩu thành công.' })
}

export async function forgotPassword(req, res) {
    const { email } = req.body
    const result = await authService.handleForgotPassword(email)
    res.jsonify(result)
}

export async function resetPassword(req, res) {
    const result = await authService.handleResetPassword(req.body)
    res.jsonify(result)
}