import Joi from 'joi'

export const createReviewSchema = Joi.object({
    rating: Joi.number().min(1).max(5).required().messages({
        'any.required': 'Vui lòng chọn mức đánh giá',
        'number.min': 'Đánh giá thấp nhất là 1',
        'number.max': 'Đánh giá cao nhất là 5'
    }),
    comment: Joi.string().allow('').max(1000)
})
