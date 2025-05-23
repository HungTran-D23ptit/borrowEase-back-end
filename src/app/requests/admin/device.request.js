import Joi from 'joi'
import { Device } from '@/models'
import { AsyncValidate, FileUpload } from '@/utils/classes'
const MAX_UPLOAD_SIZE = parseInt(process.env.MAX_UPLOAD_SIZE, 10) || 5

export const createDevice = Joi.object({
    name: Joi.string()
        .max(100)
        .required()
        .label('Tên thiết bị'),

    code: Joi.string()
        .max(50)
        .required()
        .label('Mã thiết bị')
        .custom((value, helpers) =>
            new AsyncValidate(value, async function(req) {
                if (!value) return value
                const query = { code: value, deleted: false }
                if (req && req.params && req.params.deviceId) {
                    query._id = { $ne: req.params.deviceId }
                }
                const existing = await Device.findOne(query)
                return !existing ? value : helpers.error('any.exists')
            })
        ),

    description: Joi.string()
        .max(500)
        .allow('')
        .label('Mô tả'),

    status: Joi.string()
        .valid('AVAILABLE', 'BORROWED', 'BROKEN', 'LOST')
        .default('AVAILABLE')
        .label('Trạng thái'),

    quantity: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .label('Số lượng'),

    image: Joi.alternatives().try(
        Joi.object({
            originalname: Joi.string().trim().required().label('Tên ảnh'),
            mimetype: Joi.valid('image/jpeg', 'image/png', 'image/svg+xml', 'image/webp')
                .required()
                .label('Định dạng ảnh'),
            buffer: Joi.binary()
                .max(MAX_UPLOAD_SIZE * 1024 ** 2)
                .required()
                .label('Ảnh thiết bị'),
        })
            .unknown(true)
            .instance(FileUpload)
            .label('Ảnh thiết bị'),
        Joi.string().valid('remove').label('Xóa ảnh')
    )
        .allow('')
        .label('Ảnh thiết bị'),
})

export const updateDevice = createDevice.fork(Object.keys(createDevice.describe().keys), (schema) =>
    schema.optional()
)
