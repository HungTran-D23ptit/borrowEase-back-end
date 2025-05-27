import createModel from './base'
import mongoose from 'mongoose'

const Review = createModel('Review', 'reviews', {
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    device: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Device',
        required: true
    },
    request: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BorrowRequest',
        required: true,
        unique: true 
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true,
        default: ''
    },
    created_at: {
        type: Date,
        default: Date.now
    }
})

export default Review
