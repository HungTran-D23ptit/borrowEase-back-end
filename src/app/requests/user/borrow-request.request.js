import Joi from 'joi'

export const createBorrowRequest = Joi.object({
    
    quantity: Joi.number().integer().min(1).required().messages({
        'any.required': 'Số lượng là bắt buộc',
        'number.base': 'Số lượng phải là số',
        'number.min': 'Số lượng ít nhất là 1',
    }),

    borrow_date: Joi.date().iso().required().messages({
        'any.required': 'Ngày mượn là bắt buộc',
        'date.base': 'Ngày mượn không hợp lệ (định dạng ISO)',
    }),

    return_date: Joi.date().iso().greater(Joi.ref('borrow_date')).required().messages({
        'any.required': 'Ngày trả là bắt buộc',
        'date.base': 'Ngày trả không hợp lệ (định dạng ISO)',
        'date.greater': 'Ngày trả phải sau ngày mượn',
    }),

    reason: Joi.string().max(255).required().messages({
        'any.required': 'Lý do mượn thiết bị là bắt buộc',
        'string.max': 'Lý do mượn không được vượt quá 255 ký tự',
    }),
})
