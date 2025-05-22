import moment from 'moment'
import jwt from 'jsonwebtoken'
import { cache, LOGIN_EXPIRE_IN, TOKEN_TYPE, VALIDATE_EMAIL_REGEX } from '@/configs'
import { abort, generateToken } from '@/utils/helpers'
import { Admin, User, STATUS_ACCOUNT} from '@/models'

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
    userData.login_provider = 'local'

    const user = await User.create(userData)

    return user
}
