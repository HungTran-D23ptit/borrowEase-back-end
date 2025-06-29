import Joi from 'joi'
import { VALIDATE_PHONE_REGEX, VALIDATE_EMAIL_REGEX, VALIDATE_FULL_NAME_REGEX } from '@/configs'
import { User } from '@/models'
import { AsyncValidate, FileUpload } from '@/utils/classes'
const MAX_UPLOAD_SIZE = parseInt(process.env.MAX_UPLOAD_SIZE, 10) || 5

export const createUser = Joi.object({
    name: Joi.string()
        .pattern(VALIDATE_FULL_NAME_REGEX)
        .max(50)
        .label('Tên người dùng'),
    
    email: Joi.string()
        .pattern(VALIDATE_EMAIL_REGEX)
        .label('Email')
        .custom((value, helpers) => 
            new AsyncValidate(value, async function(req) {
                if (!value) return value
                const query = { email: value, deleted: false }
                if (req && req.params && req.params.id) {
                    query._id = { $ne: req.params.id }
                }
                const existingUser = await User.findOne(query)
                return !existingUser ? value : helpers.error('any.exists')
            })
        ),
    
    phone: Joi.string()
        .pattern(VALIDATE_PHONE_REGEX)
        .label('Số điện thoại')
        .custom((value, helpers) => 
            new AsyncValidate(value, async function(req) {
                if (!value) return value
                const query = { phone: value, deleted: false }
                if (req && req.params && req.params.id) {
                    query._id = { $ne: req.params.id }
                }
                const existingUser = await User.findOne(query)
                return !existingUser ? value : helpers.error('any.exists')
            })
        ),

    gender: Joi.string().valid('male', 'female', 'other', '').label('Giới tính'),

    dob: Joi.date().allow(null, '').label('Ngày sinh'),

    address: Joi.string().max(200).allow('').label('Địa chỉ'),

    department: Joi.string().allow('').label('Khoa'),

    avatar: Joi.alternatives().try(
        Joi.object({
            originalname: Joi.string().trim().required().label('Tên ảnh'),
            mimetype: Joi.valid('image/jpeg', 'image/png', 'image/svg+xml', 'image/webp')
                .required()
                .label('Định dạng ảnh'),
            buffer: Joi.binary()
                .max(MAX_UPLOAD_SIZE * 1024 ** 2)
                .required()
                .label('Ảnh đại diện'),
        })
            .unknown(true)
            .instance(FileUpload)
            .label('Ảnh đại diện'),
        Joi.string().valid('remove').label('Xóa ảnh')
    )
        .allow('')
        .label('Ảnh đại diện'),

    password: Joi.string().required().label('Mật khẩu') 
})

export const updateUser = createUser.fork(['password'], (schema) => schema.optional())
