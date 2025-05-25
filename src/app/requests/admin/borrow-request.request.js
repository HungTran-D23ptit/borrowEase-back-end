import Joi from 'joi'

export const rejectRequest = Joi.object({
    note: Joi.string().max(255).required().messages({
        'any.required': 'Lý do từ chối là bắt buộc',
        'string.max': 'Lý do từ chối không được vượt quá 255 ký tự',
    }),
})
