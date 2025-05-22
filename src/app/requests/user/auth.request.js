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
