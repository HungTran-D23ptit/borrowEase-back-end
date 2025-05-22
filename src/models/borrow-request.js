import createModel, {ObjectId} from './base'

const BorrowRequest = createModel('BorrowRequest', 'borrow_requests', {
    user_id: {
        type: ObjectId,
        required: true,
    },
    device_id: {
        type: ObjectId,
        required: true,
    },
    start_date: {
        type: Date,
        required: true,
    },
    end_date: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'RETURNED'],
        default: 'PENDING',
    },
    reason: {
        type: String,
        default: '',
    },
    deleted: {
        type: Boolean,
        default: false,
    },
})

export default BorrowRequest
