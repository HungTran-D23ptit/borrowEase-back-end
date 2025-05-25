import createModel from './base'
import mongoose from 'mongoose'

const BorrowRequest = createModel('BorrowRequest', 'borrow_requests', {
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    device: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Device',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
    },
    reason: {
        type: String,
        required: true,
    },
    borrow_date: {
        type: Date,
        required: true,
    },
    return_date: {
        type: Date,
        required: true,
    },
    actual_return_date: {
        type: Date, 
        default: null,
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'RETURNED'],
        default: 'PENDING',
    },
    note: {
        type: String,
        default: '',
    },
}, {
    timestamps: true
})

export default BorrowRequest
