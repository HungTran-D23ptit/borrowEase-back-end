import Joi from 'joi'
import {VALIDATE_EMAIL_REGEX} from '@/configs'

export const login = Joi.object({
    email: Joi.string().pattern(VALIDATE_EMAIL_REGEX).required().label('Email'),
    password: Joi.string().required().label('Mật khẩu'),
})

export const register = Joi.object({
    name: Joi.string().required().label('Họ tên'),
    email: Joi.string().pattern(VALIDATE_EMAIL_REGEX).required().label('Email'),
    password: Joi.string().required().label('Mật khẩu')
})

export const loginGoogle = Joi.object({
    id_token: Joi.string().required().label('Mã thông tin đăng nhập Google'),
})

export const changePassword = Joi.object({
    currentPassword: Joi.string().required().label('Mật khẩu hiện tại'),
    newPassword: Joi.string().min(6).required().label('Mật khẩu mới'),
    confirmPassword: Joi.any()
        .valid(Joi.ref('newPassword'))
        .required()
        .label('Xác nhận mật khẩu')
        .messages({ 'any.only': '{{#label}} không khớp với mật khẩu mới' }),
})

export const forgotPassword = Joi.object({
    email: Joi.string()
        .pattern(VALIDATE_EMAIL_REGEX).label('Email')
        .required()
        .label('Tài khoản'),
})

export const resetPassword = Joi.object({
    email: Joi.string()
        .pattern(VALIDATE_EMAIL_REGEX).label('Email')
        .required()
        .label('Tài khoản'),
    otp: Joi.string().length(6).required().label('Mã OTP'),
    newPassword: Joi.string().min(6).required().label('Mật khẩu mới'),
    confirmPassword: Joi.any()
        .valid(Joi.ref('newPassword'))
        .required()
        .label('Xác nhận mật khẩu')
        .messages({ 'any.only': '{{#label}} không khớp với mật khẩu mới' }),
})