import Joi from 'joi'
import {VALIDATE_PHONE_REGEX} from '@/configs'

export const login = Joi.object({
    phone: Joi.string().pattern(VALIDATE_PHONE_REGEX).required().label('Số điện thoại'),
    password: Joi.string().required().label('Mật khẩu'),
})
