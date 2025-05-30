import moment from 'moment'
import jwt from 'jsonwebtoken'
import {OAuth2Client} from 'google-auth-library'
import { cache, LOGIN_EXPIRE_IN, TOKEN_TYPE, VALIDATE_EMAIL_REGEX } from '@/configs'
import { abort, generateToken } from '@/utils/helpers'
import { Admin, User, STATUS_ACCOUNT, LOGIN_PROVIDER, OtpCode} from '@/models'
import {generateOtp} from '@/utils/helpers/otp.helper'
import {sendOtp} from '@/utils/helpers/notification.helper'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
export const tokenBlocklist = cache.create('token-block-list')

// Đăng nhập admin
export async function checkValidLoginAdmin({ email, password }) {
    const admin = await Admin.findOne({ email, deleted: false })

    if (admin) {
        const verified = admin.verifyPassword(password)
        if (verified) {
            if (admin.status === STATUS_ACCOUNT.DE_ACTIVE) {
                abort(400, 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản lý.')
            }
            return admin
        }
    }

    return false
}

// Tạo token cho admin
export function authToken(admin) {
    const accessToken = generateToken({ adminId: admin._id }, TOKEN_TYPE.ADMIN_AUTHORIZATION, LOGIN_EXPIRE_IN)
    const decode = jwt.decode(accessToken)
    const expireIn = decode.exp - decode.iat
    return {
        access_token: accessToken,
        expire_in: expireIn,
        auth_type: 'Bearer Token',
    }
}

// Lấy thông tin profile admin
export async function profileAdmin(currentAdmin) {
    const acc = await Admin.findById(currentAdmin._id).select('-password').lean()
    return acc
}

// Đăng nhập user
export async function checkValidLoginUser({ email, password }) {
    const user = await User.findOne({ email, deleted: false })

    if (user) {
        const verified = user.verifyPassword(password)
        if (verified) {
            if (user.status === STATUS_ACCOUNT.DE_ACTIVE) {
                abort(400, 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản lý.')
            }
            return user
        }
    }

    return false
}

// Tạo token cho user
export function authTokenUser(user) {
    const accessToken = generateToken({ userId: user._id }, TOKEN_TYPE.USER_AUTHORIZATION, LOGIN_EXPIRE_IN)
    const decode = jwt.decode(accessToken)
    const expireIn = decode.exp - decode.iat
    return {
        access_token: accessToken,
        expire_in: expireIn,
        auth_type: 'Bearer Token',
    }
}

// Chặn token
export async function blockToken(token) {
    const decoded = jwt.decode(token)
    const expiresIn = decoded.exp
    const now = moment().unix()
    await tokenBlocklist.set(token, 1, expiresIn - now)
}

// Đăng ký
export async function registerUser(userData) {
    if (!VALIDATE_EMAIL_REGEX.test(userData.email)) {
        abort(400, 'Email không hợp lệ.')
    }

    const existingEmail = await User.findOne({ email: userData.email, deleted: false })
    if (existingEmail) {
        abort(400, 'Email đã được sử dụng.')
    }

    userData.phone = '' 
    userData.login_provider = LOGIN_PROVIDER.LOCAL

    const user = await User.create(userData)

    return user
}

export async function handleLoginWithGoogle(id_token) {
    try {
        const ticket = await client.verifyIdToken({
            idToken: id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        })
        const payload = ticket.getPayload()
        const {email, name, picture} = payload

        let user = await User.findOne({email})
        if (!user) {
            user = await User.create({
                name,
                email,
                avatar: picture,
                password: Math.random().toString(36).slice(-8), // random, không dùng
                login_provider: LOGIN_PROVIDER.GOOGLE,
                status: STATUS_ACCOUNT.ACTIVE,
            })
        }

        return authTokenUser(user)
    } catch (error) {
        console.log('Google login error:', error)
        abort(400, 'Đăng nhập thất bại.')
    }

}

export async function changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId)

    if (!user) {
        abort(404, 'Người dùng không tồn tại.')
    }

    const isValid = user.verifyPassword(currentPassword)
    if (!isValid) {
        abort(400, 'Mật khẩu hiện tại không chính xác.')
    }

    user.password = newPassword
    await user.save()
}

const otpFailCache = cache.create('otp-fail-attempts')
const MAX_ATTEMPTS = 5
const LOCK_TIME_SECONDS = 15 * 60 // 15 phút

// Quên mật khẩu
export async function handleForgotPassword(username) {
    const user = await User.findOne({ email: username, deleted: false })

    // Vẫn trả về thông điệp trung tính nếu không tìm thấy
    if (!user) {
        return { message: 'Nếu tài khoản tồn tại, mã xác thực sẽ được gửi.' }
    }

    const lockKey = `otp:locked:${user._id}`
    const lockData = await otpFailCache.get(lockKey)

    if (lockData && lockData.expiresAt) {
        const now = Date.now()
        const remaining = lockData.expiresAt - now

        if (remaining > 0) {
            const minutes = Math.floor(remaining / 60000)
            const seconds = Math.floor((remaining % 60000) / 1000)
            abort(429, `Tài khoản đang bị khóa. Vui lòng thử lại sau ${minutes} phút ${seconds} giây.`)
        } else {
            // Hết hạn nhưng chưa bị xóa → set null thay cho remove
            await otpFailCache.set(lockKey, null)
        }
    }

    // Gửi OTP
    const otp = generateOtp()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // hiệu lực 5 phút

    await OtpCode.findOneAndUpdate(
        { userId: user._id, type: 'reset_password' },
        { otp, expiresAt, createdAt: new Date() },
        { upsert: true }
    )

    await sendOtp(user, otp)

    return { message: 'Mã xác thực đã được gửi.' }
}

// Đặt lại mật khẩu
export async function handleResetPassword({ email, otp, newPassword }) {
    const user = await User.findOne({ email, deleted: false })

    if (!user) {
        abort(404, 'Tài khoản không tồn tại.')
    }

    const lockKey = `otp:locked:${user._id}`
    const failKey = `otp:fail:${user._id}`

    const lockData = await otpFailCache.get(lockKey)

    if (lockData && lockData.expiresAt) {
        const now = Date.now()
        const remaining = lockData.expiresAt - now
        if (remaining > 0) {
            const minutes = Math.floor(remaining / 60000)
            const seconds = Math.floor((remaining % 60000) / 1000)
            abort(429, `Tài khoản đang bị khóa. Vui lòng thử lại sau ${minutes} phút ${seconds} giây.`)
        } else {
            await otpFailCache.set(lockKey, null)
        }
    }

    const record = await OtpCode.findOne({
        userId: user._id,
        type: 'reset_password',
        otp,
        expiresAt: { $gt: new Date() },
    })

    if (!record) {
        const attempts = (await otpFailCache.get(failKey)) || 0
        const newAttempts = typeof attempts === 'number' ? attempts + 1 : 1
        await otpFailCache.set(failKey, newAttempts)

        if (newAttempts >= MAX_ATTEMPTS) {
            await otpFailCache.set(lockKey, {
                locked: true,
                expiresAt: Date.now() + LOCK_TIME_SECONDS * 1000,
            })
            console.log('[DEBUG] Tài khoản bị khóa:', lockKey)
            abort(429, 'Bạn đã nhập sai quá nhiều lần. Tài khoản bị khóa trong 15 phút.')
        }

        const remaining = MAX_ATTEMPTS - newAttempts
        abort(400, `Mã OTP không đúng. Bạn còn ${remaining} lần thử.`)
    }

    // OTP hợp lệ → cập nhật mật khẩu
    user.password = newPassword
    await user.save()

    // Xóa OTP và reset số lần sai
    await OtpCode.deleteOne({ _id: record._id })
    await otpFailCache.set(failKey, null)

    return { message: 'Đổi mật khẩu thành công.' }
}
