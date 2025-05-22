import createModel, {ObjectId} from './base'

const Notification = createModel('Notification', 'notifications', {
    user_id: {
        type: ObjectId,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    is_read: {
        type: Boolean,
        default: false,
    },
    deleted: {
        type: Boolean,
        default: false,
    },
})

export default Notification
