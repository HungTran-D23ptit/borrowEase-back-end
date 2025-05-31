import createModel, { ObjectId } from './base'

const Notification = createModel('Notification', 'notifications', {
    user_id: {
        type: ObjectId,
        required: true,
        ref: 'User',
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['APPROVED', 'REJECTED', 'REMINDER', 'OVERDUE', 'GENERAL'],
        default: 'GENERAL',
    },
    related_id: {
        type: ObjectId,
        default: null,
    },
    related_type: {
        type: String,
        enum: ['BORROW_REQUEST', 'DEVICE', null],
        default: null,
    },
    is_read: {
        type: Boolean,
        default: false,
    },
    deleted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true, 
})

export default Notification
